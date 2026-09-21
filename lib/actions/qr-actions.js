'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSession, requireAdmin, requireAuth } from '@/lib/auth/session';
import { bulkInsertQrs, updateQrStatus, getQrByCode } from '@/lib/db/queries/qr';
import { activateQrTransaction } from '@/lib/db/queries/business';
import { generateBatchQrCodes } from '@/lib/utils/code-generator';
import { validateBusinessInput } from '@/lib/utils/validation';

/**
 * Mass generate QR codes (Admin Only)
 */
export async function massGenerateQrAction(formData) {
  try {
    await requireAdmin();
    const quantity = parseInt(formData.get('quantity') || '10', 10);
    const validQty = Math.min(Math.max(1, isNaN(quantity) ? 10 : quantity), 500);

    const codes = generateBatchQrCodes(validQty);
    await bulkInsertQrs(codes);

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    return { success: true, count: validQty };
  } catch (error) {
    console.error('Error in massGenerateQrAction:', error);
    return { success: false, error: error.message || 'Gagal generate QR' };
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
