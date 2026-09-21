'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSession, requireAdmin, requireAuth } from '@/lib/auth/session';
import {
  bulkInsertQrs,
  updateQrStatus,
  getQrByCode,
  createBatchWithQrs,
  resetQrAdmin,
  resetBatchAdmin,
} from '@/lib/db/queries/qr';
import { activateQrTransaction } from '@/lib/db/queries/business';
import { generateBatchQrCodes } from '@/lib/utils/code-generator';
import { validateBusinessInput } from '@/lib/utils/validation';

/**
 * Mass generate QR codes in a new Batch (Admin Only)
 */
export async function massGenerateQrAction(formData) {
  try {
    await requireAdmin();
    const quantity = parseInt(formData.get('quantity') || '10', 10);
    const mode = formData.get('mode') || 'batch'; // 'batch' | 'individual'
    const validQty = Math.min(Math.max(1, isNaN(quantity) ? 10 : quantity), 500);

    let result;
    if (mode === 'individual') {
      const codes = generateBatchQrCodes(validQty);
      const insertedQrs = await bulkInsertQrs(codes, null);
      result = {
        batch: null,
        qrs: insertedQrs.map((q) => ({
          ...q,
          batchCode: null,
          batchId: null,
          businessName: null,
          ownerEmail: null,
          scanCount: 0,
        })),
      };
    } else {
      result = await createBatchWithQrs(validQty);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    return {
      success: true,
      count: validQty,
      mode,
      batch: result.batch,
      newQrs: result.qrs,
    };
  } catch (error) {
    console.error('Error in massGenerateQrAction:', error);
    let errMsg = error.message || 'Gagal generate QR';
    if (errMsg.includes('relation') || errMsg.includes('does not exist')) {
      errMsg = 'Tabel database belum dibuat di Supabase. Silakan buka Supabase SQL Editor dan jalankan file supabase/migrations/0002_qr_batches.sql.';
    } else if (errMsg.includes('UNAUTHORIZED') || errMsg.includes('FORBIDDEN')) {
      errMsg = 'Sesi login Anda bukan Admin atau telah berakhir. Silakan login kembali sebagai Admin.';
    }
    return { success: false, error: errMsg };
  }
}

/**
 * Update QR Status (Admin Only: e.g. blank -> sold, active <-> disabled)
 */
export async function updateQrStatusAction(qrId, newStatus) {
  try {
    await requireAdmin();
    const validStatuses = ['blank', 'sold', 'active', 'disabled'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Status tidak valid' };
    }

    await updateQrStatus(qrId, newStatus);

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    return { success: true };
  } catch (error) {
    console.error('Error in updateQrStatusAction:', error);
    return { success: false, error: error.message || 'Gagal update status' };
  }
}

/**
 * Reset Single QR (Admin Only):
 * Sets status back to 'blank', removes business linkage, clears activatedAt & soldAt.
 * Preserves the physical QR record and unique code for reuse.
 */
export async function resetQrAction(qrId) {
  try {
    await requireAdmin();
    if (!qrId) {
      return { success: false, error: 'ID QR tidak valid' };
    }

    const reset = await resetQrAdmin(qrId);

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    revalidatePath('/dashboard');
    return { success: true, qr: reset };
  } catch (error) {
    console.error('Error in resetQrAction:', error);
    return { success: false, error: error.message || 'Gagal mereset QR' };
  }
}

/**
 * Reset Entire Batch (Admin Only):
 * Sets all QRs in this batch back to 'blank', removes business linkage.
 * Preserves the batch record and all QR records for reuse.
 */
export async function resetBatchAction(batchId) {
  try {
    await requireAdmin();
    if (!batchId) {
      return { success: false, error: 'ID Batch tidak valid' };
    }

    const resetList = await resetBatchAdmin(batchId);

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    revalidatePath('/dashboard');
    return { success: true, count: resetList.length };
  } catch (error) {
    console.error('Error in resetBatchAction:', error);
    return { success: false, error: error.message || 'Gagal mereset batch' };
  }
}

/**
 * Activate QR code for authenticated customer
 */
export async function activateQrAction(prevState, formData) {
  try {
    const session = await requireAuth();
    const code = formData.get('code');
    const businessName = formData.get('businessName');
    const instagramUrl = formData.get('instagramUrl');
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');

    if (!code) {
      return { success: false, error: 'Kode QR tidak valid' };
    }

    // Validate inputs
    const validation = validateBusinessInput({
      businessName,
      instagramUrl,
      wifiName,
      wifiPassword,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError, errors: validation.errors };
    }

    // Execute transactional activation
    const result = await activateQrTransaction({
      userId: session.user.id,
      qrCodeValue: code,
      businessData: validation.sanitized,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    revalidatePath(`/q/${code}`);
    revalidatePath(`/activate/${code}`);

    return { success: true, code };
  } catch (error) {
    console.error('Error in activateQrAction:', error);
    return { success: false, error: error.message || 'Gagal aktivasi QR' };
  }
}
