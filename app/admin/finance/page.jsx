import React from 'react';
import { requireAdmin } from '@/lib/auth/session';
import {
  ensureFinanceTableInitialized,
  getFinanceTransactions,
  getFinanceSummary,
  getJournalEntries,
  getGeneralLedger,
  getTrialBalance,
  getIncomeStatement,
  getCashFlowStatement,
} from '@/lib/db/queries/finance';
import { getDateRangeForPeriod } from '@/lib/utils/finance-constants';
import FinanceManager from '@/components/admin/finance/FinanceManager';

export const metadata = {
  title: 'Pembukuan & Keuangan Lengkap - Admin Cobascan',
  description: 'Sistem akuntansi terintegrasi: Jurnal Umum, Buku Besar, Neraca Saldo, Laba Rugi, dan Arus Kas.',
};

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage({ searchParams }) {
  await requireAdmin();

  const resolvedParams = await searchParams;
  const period = resolvedParams?.period || 'all';
  const customStart = resolvedParams?.startDate || null;
  const customEnd = resolvedParams?.endDate || null;

  const dateRange = getDateRangeForPeriod(period, customStart, customEnd);
  const filterParams = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };

  // Ensure DB schema and tables are ready once before parallel read queries
  await ensureFinanceTableInitialized();

  // Fetch all accounting reports concurrently
  const [
    rawTransactions,
    summary,
    rawJournals,
    ledger,
    trialBalance,
    incomeStatement,
    cashFlow,
  ] = await Promise.all([
    getFinanceTransactions({ ...filterParams, limit: 150 }),
    getFinanceSummary(filterParams),
    getJournalEntries({ ...filterParams, limit: 150 }),
    getGeneralLedger(filterParams),
    getTrialBalance(filterParams),
    getIncomeStatement(filterParams),
    getCashFlowStatement(filterParams),
  ]);

  // Serialize dates to prevent hydration differences
  const transactions = (rawTransactions || []).map((t) => ({
    ...t,
    transactionDate: t.transactionDate ? new Date(t.transactionDate).toISOString() : null,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : null,
  }));

  const journals = (rawJournals || []).map((j) => ({
    ...j,
    entryDate: j.entryDate ? new Date(j.entryDate).toISOString() : null,
    createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    updatedAt: j.updatedAt ? new Date(j.updatedAt).toISOString() : null,
  }));

  const serializedLedger = (ledger || []).map((acc) => ({
    ...acc,
    transactions: (acc.transactions || []).map((tx) => ({
      ...tx,
      entryDate: tx.entryDate ? new Date(tx.entryDate).toISOString() : null,
    })),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <FinanceManager
        initialTransactions={transactions}
        initialSummary={summary}
        initialJournals={journals}
        initialLedger={serializedLedger}
        initialTrialBalance={trialBalance || {}}
        initialIncomeStatement={incomeStatement || {}}
        initialCashFlow={cashFlow || {}}
        activePeriod={period}
        periodLabel={dateRange.label}
        customStart={customStart}
        customEnd={customEnd}
      />
    </div>
  );
}
