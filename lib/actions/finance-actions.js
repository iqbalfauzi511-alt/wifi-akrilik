'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import {
  createFinanceTransaction,
  deleteFinanceTransaction,
  createJournalEntry,
} from '@/lib/db/queries/finance';

/**
 * Server Action: Create a new manual cashflow transaction
 */
export async function createFinanceTransactionAction(data) {
  try {
    await requireAdmin();

    const { type, category, amount, transactionDate, description, referenceNumber } = data;

    if (!type || !['income', 'expense'].includes(type)) {
      return { success: false, error: 'Pilih jenis transaksi (Pemasukan atau Pengeluaran).' };
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return { success: false, error: 'Masukkan nominal uang yang valid (lebih dari 0).' };
    }

    if (!category) {
      return { success: false, error: 'Kategori transaksi wajib dipilih.' };
    }

    const created = await createFinanceTransaction({
      type,
      category,
      amount: numAmount,
      transactionDate: transactionDate || new Date().toISOString(),
      description,
      referenceNumber,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/finance');

    return { success: true, transaction: created };
  } catch (error) {
    console.error('Error in createFinanceTransactionAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan transaksi.' };
  }
}

/**
 * Server Action: Create a manual double-entry journal entry
 */
export async function createJournalEntryAction(data) {
  try {
    await requireAdmin();

    const { entryNumber, entryDate, description, referenceNumber, items } = data;

    if (!items || items.length < 2) {
      return { success: false, error: 'Jurnal harus memiliki minimal 2 baris akun (Debit dan Kredit).' };
    }

    const created = await createJournalEntry({
      entryNumber,
      entryDate,
      description,
      referenceNumber,
      transactionType: 'jurnal_manual',
      items,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/finance');

    return { success: true, entry: created };
  } catch (error) {
    console.error('Error in createJournalEntryAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan jurnal umum.' };
  }
}

/**
 * Server Action: Delete a transaction
 */
export async function deleteFinanceTransactionAction(id) {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: 'ID transaksi tidak valid.' };
    }

    const deleted = await deleteFinanceTransaction(id);
    if (!deleted) {
      return { success: false, error: 'Transaksi tidak ditemukan atau gagal dihapus.' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/finance');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteFinanceTransactionAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus transaksi.' };
  }
}
