import { db, ensureDatabaseInitialized } from '../index.js';
import { financeTransactions, journalEntries, journalItems } from '../schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import {
  FINANCE_CATEGORIES,
  CHART_OF_ACCOUNTS,
  getAccountByCode,
  getCategoryLabel,
} from '../../utils/finance-constants.js';

export { FINANCE_CATEGORIES, CHART_OF_ACCOUNTS, getAccountByCode, getCategoryLabel };

let isFinanceTableReady = false;

/**
 * Ensures finance_transactions, journal_entries, and journal_items exist in database
 */
export async function ensureFinanceTableInitialized() {
  await ensureDatabaseInitialized();
  if (isFinanceTableReady) return;

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(16) NOT NULL,
        category VARCHAR(64) NOT NULL,
        amount INTEGER NOT NULL,
        transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        description TEXT,
        reference_number VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        finance_transaction_id UUID,
        entry_number VARCHAR(64) NOT NULL,
        entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        description TEXT,
        reference_number VARCHAR(64),
        transaction_type VARCHAR(32) NOT NULL DEFAULT 'jurnal_umum',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    try {
      await db.execute(sql`
        ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS finance_transaction_id UUID;
      `);
    } catch {
      // column already exists
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS journal_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_code VARCHAR(16) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        debit INTEGER NOT NULL DEFAULT 0,
        credit INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_transactions(type);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(transaction_date);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_journal_entries_ft_id ON journal_entries(finance_transaction_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_journal_items_entry ON journal_items(entry_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_journal_items_account ON journal_items(account_code);`);
    } catch {
      // index exists
    }

    isFinanceTableReady = true;

    // Run auto-sync for any un-synced transactions
    await syncAllTransactionsToJournal();
  } catch (err) {
    console.warn('[Finance DB Init Error]:', err?.message || err);
  }
}

/**
 * Helper to build date range conditions
 */
function buildDateCondition(column, startDate, endDate) {
  const conditions = [];
  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      conditions.push(gte(column, start));
    }
  }
  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      if (typeof endDate === 'string' && !endDate.includes('T')) {
        end.setHours(23, 59, 59, 999);
      }
      conditions.push(lte(column, end));
    }
  }
  return conditions;
}

// =========================================================================
// 1. PEMBUKUAN KAS (Cash Flow Simple)
// =========================================================================

export async function getFinanceTransactions({
  type = null,
  category = null,
  startDate = null,
  endDate = null,
  limit = 100,
  offset = 0,
} = {}) {
  await ensureFinanceTableInitialized();

  const conditions = buildDateCondition(financeTransactions.transactionDate, startDate, endDate);

  if (type && (type === 'income' || type === 'expense')) {
    conditions.push(eq(financeTransactions.type, type));
  }

  if (category) {
    conditions.push(eq(financeTransactions.category, category));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    return await db
      .select()
      .from(financeTransactions)
      .where(whereClause)
      .orderBy(desc(financeTransactions.transactionDate), desc(financeTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    console.error('Error fetching finance transactions:', err);
    return [];
  }
}

export async function getFinanceSummary({ startDate = null, endDate = null } = {}) {
  await ensureFinanceTableInitialized();

  const conditions = buildDateCondition(financeTransactions.transactionDate, startDate, endDate);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const allInFilter = await db
      .select({
        type: financeTransactions.type,
        category: financeTransactions.category,
        amount: financeTransactions.amount,
      })
      .from(financeTransactions)
      .where(whereClause);

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeByCategory = {};
    const expenseByCategory = {};

    for (const item of allInFilter || []) {
      const amt = Number(item.amount) || 0;
      if (item.type === 'income') {
        totalIncome += amt;
        incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + amt;
      } else if (item.type === 'expense') {
        totalExpense += amt;
        expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + amt;
      }
    }

    const netProfit = totalIncome - totalExpense;
    const marginPercentage = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      netProfit,
      marginPercentage,
      totalTransactions: (allInFilter || []).length,
      incomeByCategory,
      expenseByCategory,
    };
  } catch (err) {
    console.error('Error fetching finance summary:', err);
    return {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      marginPercentage: 0,
      totalTransactions: 0,
      incomeByCategory: {},
      expenseByCategory: {},
    };
  }
}

// =========================================================================
// 2. JURNAL UMUM (General Journal)
// =========================================================================

export async function getJournalEntries({ startDate = null, endDate = null, limit = 100 } = {}) {
  await ensureFinanceTableInitialized();

  const conditions = buildDateCondition(journalEntries.entryDate, startDate, endDate);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const entries = await db
      .select()
      .from(journalEntries)
      .where(whereClause)
      .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
      .limit(limit);

    if (entries.length === 0) return [];

    const entryIds = entries.map((e) => e.id);

    const items = await db
      .select()
      .from(journalItems)
      .where(sql`${journalItems.entryId} IN (${sql.join(entryIds.map((id) => sql`${id}`), sql`, `)})`)
      .orderBy(desc(journalItems.debit)); // debit first, then credit

    // Group items by entryId
    const itemMap = {};
    for (const it of items) {
      if (!itemMap[it.entryId]) itemMap[it.entryId] = [];
      itemMap[it.entryId].push(it);
    }

    return entries.map((e) => ({
      ...e,
      items: itemMap[e.id] || [],
    }));
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    return [];
  }
}

/**
 * Create a balanced double-entry journal entry
 */
export async function createJournalEntry({
  financeTransactionId = null,
  entryNumber = null,
  entryDate = null,
  description = '',
  referenceNumber = null,
  transactionType = 'jurnal_umum',
  items = [],
}) {
  await ensureFinanceTableInitialized();

  if (!items || items.length < 2) {
    throw new Error('Jurnal umum harus memiliki minimal 2 baris akun (Debit dan Kredit).');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const it of items) {
    totalDebit += Math.round(Number(it.debit) || 0);
    totalCredit += Math.round(Number(it.credit) || 0);
  }

  if (totalDebit !== totalCredit || totalDebit <= 0) {
    throw new Error(`Jurnal tidak seimbang: Total Debit (${totalDebit}) harus sama dengan Total Kredit (${totalCredit}).`);
  }

  const generatedNo = entryNumber || `JU-${Date.now().toString().slice(-6)}`;

  const [entry] = await db
    .insert(journalEntries)
    .values({
      financeTransactionId,
      entryNumber: generatedNo,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      description: description || 'Transaksi Jurnal',
      referenceNumber,
      transactionType,
    })
    .returning();

  const insertItems = items.map((it) => {
    const acc = getAccountByCode(it.accountCode);
    return {
      entryId: entry.id,
      accountCode: it.accountCode,
      accountName: it.accountName || acc.name,
      debit: Math.round(Number(it.debit) || 0),
      credit: Math.round(Number(it.credit) || 0),
      notes: it.notes || null,
    };
  });

  await db.insert(journalItems).values(insertItems);

  return { ...entry, items: insertItems };
}

// =========================================================================
// 3. CREATE FINANCE TRANSACTION (with Auto-Journaling)
// =========================================================================

export async function createFinanceTransaction({
  type,
  category,
  amount,
  transactionDate = null,
  description = null,
  referenceNumber = null,
}) {
  await ensureFinanceTableInitialized();

  const parsedAmount = Math.round(Math.abs(Number(amount)));
  if (!parsedAmount || isNaN(parsedAmount)) {
    throw new Error('Nominal uang harus berupa angka positif.');
  }

  if (type !== 'income' && type !== 'expense') {
    throw new Error('Tipe transaksi harus "income" (pemasukan) atau "expense" (pengeluaran).');
  }

  const [created] = await db
    .insert(financeTransactions)
    .values({
      type,
      category: (category || 'lainnya').trim(),
      amount: parsedAmount,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      description: description ? description.trim() : null,
      referenceNumber: referenceNumber ? referenceNumber.trim() : null,
    })
    .returning();

  // Auto-create matching double-entry journal so Jurnal Umum, Buku Besar & Laba Rugi stay in sync!
  try {
    const isIncome = type === 'income';
    let targetAccCode = '401'; // Default credit for income

    if (isIncome) {
      const found = FINANCE_CATEGORIES.income.find((c) => c.id === category);
      targetAccCode = found?.defaultCreditAccount || '401';

      await createJournalEntry({
        financeTransactionId: created.id,
        entryNumber: `KM-${created.id.slice(0, 8).toUpperCase()}`,
        entryDate: created.transactionDate,
        description: description || `Pemasukan: ${getCategoryLabel(category)}`,
        referenceNumber,
        transactionType: 'pemasukan',
        items: [
          { accountCode: '101', debit: parsedAmount, credit: 0 },
          { accountCode: targetAccCode, debit: 0, credit: parsedAmount },
        ],
      });
    } else {
      const found = FINANCE_CATEGORIES.expense.find((c) => c.id === category);
      targetAccCode = found?.defaultDebitAccount || '501';

      await createJournalEntry({
        financeTransactionId: created.id,
        entryNumber: `KK-${created.id.slice(0, 8).toUpperCase()}`,
        entryDate: created.transactionDate,
        description: description || `Pengeluaran: ${getCategoryLabel(category)}`,
        referenceNumber,
        transactionType: 'pengeluaran',
        items: [
          { accountCode: targetAccCode, debit: parsedAmount, credit: 0 },
          { accountCode: '101', debit: 0, credit: parsedAmount },
        ],
      });
    }
  } catch (jErr) {
    console.warn('Auto-journal creation notice (non-fatal):', jErr?.message);
  }

  return created;
}

export async function deleteFinanceTransaction(id) {
  await ensureFinanceTableInitialized();
  if (!id) return false;

  // Explicitly delete corresponding journal items & entries
  try {
    const entries = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(eq(journalEntries.financeTransactionId, id));

    if (entries.length > 0) {
      const entryIds = entries.map((e) => e.id);
      await db
        .delete(journalItems)
        .where(sql`${journalItems.entryId} IN (${sql.join(entryIds.map((eId) => sql`${eId}`), sql`, `)})`);
      await db
        .delete(journalEntries)
        .where(eq(journalEntries.financeTransactionId, id));
    }
  } catch (err) {
    console.warn('Cascade delete journal notice:', err?.message);
  }

  const [deleted] = await db
    .delete(financeTransactions)
    .where(eq(financeTransactions.id, id))
    .returning();

  return Boolean(deleted);
}

/**
 * Automatically sync any un-journaled finance transactions into journal_entries
 */
export async function syncAllTransactionsToJournal() {
  try {
    const allFinance = await db.select().from(financeTransactions);
    const existingJournals = await db
      .select({ fId: journalEntries.financeTransactionId })
      .from(journalEntries);
    const existingSet = new Set(existingJournals.map((j) => j.fId).filter(Boolean));

    for (const f of allFinance) {
      if (!existingSet.has(f.id)) {
        const isIncome = f.type === 'income';
        const parsedAmount = Math.round(Number(f.amount) || 0);
        if (parsedAmount <= 0) continue;

        let targetAccCode = isIncome ? '401' : '501';
        if (isIncome) {
          const found = FINANCE_CATEGORIES.income.find((c) => c.id === f.category);
          targetAccCode = found?.defaultCreditAccount || '401';

          await createJournalEntry({
            financeTransactionId: f.id,
            entryNumber: `KM-${f.id.slice(0, 8).toUpperCase()}`,
            entryDate: f.transactionDate,
            description: f.description || `Pemasukan: ${getCategoryLabel(f.category)}`,
            referenceNumber: f.referenceNumber,
            transactionType: 'pemasukan',
            items: [
              { accountCode: '101', debit: parsedAmount, credit: 0 },
              { accountCode: targetAccCode, debit: 0, credit: parsedAmount },
            ],
          });
        } else {
          const found = FINANCE_CATEGORIES.expense.find((c) => c.id === f.category);
          targetAccCode = found?.defaultDebitAccount || '501';

          await createJournalEntry({
            financeTransactionId: f.id,
            entryNumber: `KK-${f.id.slice(0, 8).toUpperCase()}`,
            entryDate: f.transactionDate,
            description: f.description || `Pengeluaran: ${getCategoryLabel(f.category)}`,
            referenceNumber: f.referenceNumber,
            transactionType: 'pengeluaran',
            items: [
              { accountCode: targetAccCode, debit: parsedAmount, credit: 0 },
              { accountCode: '101', debit: 0, credit: parsedAmount },
            ],
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Auto-Sync Journal Warning]:', err?.message || err);
  }
}

// =========================================================================
// 4. BUKU BESAR (General Ledger)
// =========================================================================

export async function getGeneralLedger({ startDate = null, endDate = null, accountCode = null } = {}) {
  await ensureFinanceTableInitialized();

  const conditions = buildDateCondition(journalEntries.entryDate, startDate, endDate);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const rawItems = await db
      .select({
        id: journalItems.id,
        entryId: journalItems.entryId,
        entryNumber: journalEntries.entryNumber,
        entryDate: journalEntries.entryDate,
        description: journalEntries.description,
        referenceNumber: journalEntries.referenceNumber,
        accountCode: journalItems.accountCode,
        accountName: journalItems.accountName,
        debit: journalItems.debit,
        credit: journalItems.credit,
        notes: journalItems.notes,
      })
      .from(journalItems)
      .innerJoin(journalEntries, eq(journalItems.entryId, journalEntries.id))
      .where(whereClause)
      .orderBy(journalEntries.entryDate, journalItems.id);

    // Group by account code
    const ledgerByAccount = {};

    for (const acc of CHART_OF_ACCOUNTS) {
      ledgerByAccount[acc.code] = {
        account: acc,
        totalDebit: 0,
        totalCredit: 0,
        endingBalance: 0,
        transactions: [],
      };
    }

    for (const item of rawItems) {
      const code = item.accountCode;
      if (!ledgerByAccount[code]) {
        const accInfo = getAccountByCode(code);
        ledgerByAccount[code] = {
          account: accInfo,
          totalDebit: 0,
          totalCredit: 0,
          endingBalance: 0,
          transactions: [],
        };
      }

      const accData = ledgerByAccount[code];
      const d = Number(item.debit) || 0;
      const c = Number(item.credit) || 0;

      accData.totalDebit += d;
      accData.totalCredit += c;

      // Calculate running balance based on normal balance
      const isDebitNormal = accData.account.normalBalance === 'debit';
      const balanceDelta = isDebitNormal ? d - c : c - d;
      accData.endingBalance += balanceDelta;

      accData.transactions.push({
        ...item,
        runningBalance: accData.endingBalance,
      });
    }

    // Filter by specific account if requested, or return accounts with transactions or active
    if (accountCode) {
      return ledgerByAccount[accountCode] ? [ledgerByAccount[accountCode]] : [];
    }

    // Return list of accounts that have transactions first, then empty ones
    return Object.values(ledgerByAccount);
  } catch (err) {
    console.error('Error fetching general ledger:', err);
    return [];
  }
}

// =========================================================================
// 5. NERACA SALDO (Trial Balance)
// =========================================================================

export async function getTrialBalance({ startDate = null, endDate = null } = {}) {
  const ledger = await getGeneralLedger({ startDate, endDate });

  let totalDebit = 0;
  let totalCredit = 0;

  const rows = ledger
    .filter((l) => l.totalDebit > 0 || l.totalCredit > 0)
    .map((l) => {
      const isDebitNormal = l.account.normalBalance === 'debit';
      const balance = l.endingBalance;

      let debitBalance = 0;
      let creditBalance = 0;

      if (isDebitNormal) {
        if (balance >= 0) {
          debitBalance = balance;
        } else {
          creditBalance = Math.abs(balance);
        }
      } else {
        if (balance >= 0) {
          creditBalance = balance;
        } else {
          debitBalance = Math.abs(balance);
        }
      }

      totalDebit += debitBalance;
      totalCredit += creditBalance;

      return {
        code: l.account.code,
        name: l.account.name,
        category: l.account.category,
        debit: debitBalance,
        credit: creditBalance,
      };
    });

  return {
    rows,
    totalDebit,
    totalCredit,
    isBalanced: totalDebit === totalCredit,
    difference: Math.abs(totalDebit - totalCredit),
  };
}

// =========================================================================
// 6. LAPORAN LABA RUGI (Income Statement / Profit & Loss)
// =========================================================================

export async function getIncomeStatement({ startDate = null, endDate = null } = {}) {
  const ledger = await getGeneralLedger({ startDate, endDate });

  const revenues = [];
  const costOfGoodsSold = [];
  const operatingExpenses = [];
  const otherExpenses = [];

  let totalRevenue = 0;
  let totalCOGS = 0;
  let totalOperatingExpense = 0;
  let totalOtherExpense = 0;

  for (const l of ledger) {
    const acc = l.account;
    const balance = Math.abs(l.endingBalance);

    if (acc.category === 'pendapatan') {
      if (balance > 0) {
        revenues.push({ code: acc.code, name: acc.name, amount: balance });
        totalRevenue += balance;
      }
    } else if (acc.category === 'beban') {
      if (balance > 0) {
        if (acc.subCategory === 'hpp') {
          costOfGoodsSold.push({ code: acc.code, name: acc.name, amount: balance });
          totalCOGS += balance;
        } else if (acc.subCategory === 'operasional' || acc.subCategory === 'pemasaran' || acc.subCategory === 'umum') {
          operatingExpenses.push({ code: acc.code, name: acc.name, amount: balance });
          totalOperatingExpense += balance;
        } else {
          otherExpenses.push({ code: acc.code, name: acc.name, amount: balance });
          totalOtherExpense += balance;
        }
      }
    }
  }

  const grossProfit = totalRevenue - totalCOGS;
  const operatingIncome = grossProfit - totalOperatingExpense;
  const netIncome = operatingIncome - totalOtherExpense;
  const netMargin = totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 100) : 0;

  return {
    revenues,
    totalRevenue,
    costOfGoodsSold,
    totalCOGS,
    grossProfit,
    operatingExpenses,
    totalOperatingExpense,
    operatingIncome,
    otherExpenses,
    totalOtherExpense,
    netIncome,
    netMargin,
  };
}

// =========================================================================
// 7. LAPORAN ARUS KAS (Cash Flow Statement)
// =========================================================================

export async function getCashFlowStatement({ startDate = null, endDate = null } = {}) {
  const ledger = await getGeneralLedger({ startDate, endDate });

  // Get cash account transactions (code 101)
  const cashLedger = ledger.find((l) => l.account.code === '101');
  const cashTransactions = cashLedger?.transactions || [];

  const operatingReceipts = [];
  const operatingPayments = [];
  const financingActivities = [];

  let totalOperatingReceipts = 0;
  let totalOperatingPayments = 0;
  let totalFinancing = 0;

  for (const tx of cashTransactions) {
    const d = Number(tx.debit) || 0;
    const c = Number(tx.credit) || 0;

    if (d > 0) {
      // Cash Inflow
      operatingReceipts.push({
        date: tx.entryDate,
        description: tx.description,
        reference: tx.referenceNumber,
        amount: d,
      });
      totalOperatingReceipts += d;
    }

    if (c > 0) {
      // Cash Outflow
      operatingPayments.push({
        date: tx.entryDate,
        description: tx.description,
        reference: tx.referenceNumber,
        amount: c,
      });
      totalOperatingPayments += c;
    }
  }

  const netOperatingCashFlow = totalOperatingReceipts - totalOperatingPayments;
  const endingCashBalance = cashLedger?.endingBalance || 0;

  return {
    operatingReceipts,
    totalOperatingReceipts,
    operatingPayments,
    totalOperatingPayments,
    netOperatingCashFlow,
    financingActivities,
    totalFinancing,
    endingCashBalance,
  };
}
