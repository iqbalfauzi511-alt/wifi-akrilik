'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { requireAdmin, requireAuth, getCurrentSession, isUserAdminWa } from '@/lib/auth/session';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signSessionPayload } from '@/lib/auth/token';
import {
  bulkInsertQrs,
  updateQrStatus,
  createBatchWithQrs,
  resetQrAdmin,
  resetBatchAdmin,
  deleteQrAdmin,
  deleteBatchAdmin,
  bulkUpdateQrStatus,
  bulkDeleteQrs,
  bulkResetQrs,
  updateQrPrintStatus,
  bulkUpdateQrPrintStatus,
  customerBulkUpdateStatus,
  customerBulkUnlink,
  getPublicQrByCode,
  recordScanLog,
} from '@/lib/db/queries/qr';
import { activateQrTransaction } from '@/lib/db/queries/business';
import { generateBatchQrCodes } from '@/lib/utils/code-generator';
import { validateBusinessInput, validateGoogleMapsUrl } from '@/lib/utils/validation';

/**
 * Mass generate QR codes in a new Batch (Admin Only)
 */
export async function massGenerateQrAction(formData) {
  try {
    await requireAdmin();
    const rawQuantity = (formData.get('quantity') || '').toString().trim();
    if (!rawQuantity) {
      return { success: false, error: 'Jumlah QR tidak boleh kosong.' };
    }
    const num = Number(rawQuantity);
    if (!Number.isInteger(num) || num < 1) {
      return { success: false, error: 'Jumlah QR harus berupa angka bulat minimal 1.' };
    }
    if (num > 1000) {
      return { success: false, error: 'Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit.' };
    }
    const validQty = num;
    const mode = formData.get('mode') || 'batch'; // 'batch' | 'individual'

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
    revalidatePath('/admin/devices');
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
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
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
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, count: resetList.length };
  } catch (error) {
    console.error('Error in resetBatchAction:', error);
    return { success: false, error: error.message || 'Gagal mereset batch' };
  }
}

/**
 * Permanently Delete a Single QR Code (Admin Only)
 */
export async function deleteQrAction(qrId) {
  try {
    await requireAdmin();
    if (!qrId) {
      return { success: false, error: 'ID QR tidak valid' };
    }

    const deleted = await deleteQrAdmin(qrId);
    if (!deleted) {
      return { success: false, error: 'QR Code tidak ditemukan' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, qr: deleted };
  } catch (error) {
    console.error('Error in deleteQrAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus QR' };
  }
}

/**
 * Permanently Delete an Entire Batch of QR Codes (Admin Only)
 */
export async function deleteBatchAction(batchId) {
  try {
    await requireAdmin();
    if (!batchId) {
      return { success: false, error: 'ID Batch tidak valid' };
    }

    const result = await deleteBatchAdmin(batchId);

    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error in deleteBatchAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus batch' };
  }
}

/**
 * Activate QR code for authenticated customer or newly registering owner (Unified Atomic Action)
 */
export async function activateQrAction(prevState, formData) {
  try {
    await ensureDatabaseInitialized();
    const session = await getCurrentSession();
    let userId = session?.user?.id;

    const code = formData.get('code');
    const businessName = formData.get('businessName');
    const googleMapsReviewUrl = (formData.get('googleMapsReviewUrl') || formData.get('googleMapsUrl') || '').toString().trim();
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';
    const logoUrl = (formData.get('logoUrl') || '').toString().trim();
    const wifiName = formData.get('wifiName');
    const wifiUsername = (formData.get('wifiUsername') || '').toString().trim() || null;
    const wifiPassword = formData.get('wifiPassword');

    const targetBusinessId = (formData.get('targetBusinessId') || '').toString().trim();
    const isNewBusiness = formData.get('isNewBusiness') === 'true' || targetBusinessId === 'new';
    const isExistingBranch = targetBusinessId && targetBusinessId !== 'new';
    const rawWa = (formData.get('whatsappNumber') || formData.get('whatsapp') || '').toString().trim();
    const pin = (formData.get('pin') || '').toString().trim();
    const ownerName = (formData.get('ownerName') || formData.get('name') || '').toString().trim();

    if (!code) {
      return { success: false, error: 'Kode Cobascan tidak valid' };
    }

    // 1. If not authenticated, handle unified owner account registration/verification
    if (!userId) {
      let wa = rawWa.replace(/[^0-9]/g, '');
      if (wa.startsWith('0')) wa = '62' + wa.slice(1);
      else if (wa && !wa.startsWith('62')) wa = '62' + wa;

      if (!wa || wa.length < 10) {
        return { success: false, error: 'Nomor WhatsApp pemilik wajib diisi (minimal 10 digit).' };
      }
      if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return { success: false, error: 'PIN pengelola harus 6 angka.' };
      }

      if (isUserAdminWa(wa)) {
        return {
          success: false,
          error: 'Nomor WhatsApp ini tidak dapat digunakan untuk registrasi outlet.',
        };
      }

      // Check if user already exists (Strict Security: Require official /login for existing accounts)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.whatsappNumber, wa),
      });

      if (existingUser) {
        return {
          success: false,
          waAlreadyRegistered: true,
          error: 'Nomor WhatsApp ini sudah terdaftar. Silakan login ke akun Anda untuk mengaktifkan perangkat baru.',
        };
      }

      // Create new owner
      const pinHash = hashPassword(pin);
      const cleanName = ownerName || `Owner ${wa.slice(-4)}`;

      const [newOwner] = await db.insert(users).values({
        name: cleanName,
        role: 'customer',
        whatsappNumber: wa,
        pinHash: pinHash,
        emailVerified: true,
      }).returning();

      userId = newOwner.id;

      // Establish session cookie immediately
      const sessionPayload = signSessionPayload({
        id: userId,
        email: `${wa}@owner.cobascan.local`,
        name: ownerName || `Owner ${wa.slice(-4)}`,
        role: 'customer',
        whatsapp: wa,
      });

      const cookieStore = await cookies();
      cookieStore.set('smartwifi_session', sessionPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    let sanitizedBusinessData = {};

    if (isExistingBranch) {
      // For existing branches, inherit already validated business profile
      sanitizedBusinessData = {
        targetBusinessId,
        isNewBusiness: false,
        whatsappNumber: rawWa || undefined,
      };
    } else {
      // Validate inputs for new business or branch
      const validation = validateBusinessInput({
        businessName,
        logoUrl,
        googleMapsReviewUrl,
        googleMapsUrl: googleMapsReviewUrl,
        wifiEnabled,
        wifiName,
        wifiUsername,
        wifiPassword,
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError, errors: validation.errors };
      }

      sanitizedBusinessData = {
        ...validation.sanitized,
        whatsappNumber: rawWa || undefined,
        targetBusinessId: 'new',
        isNewBusiness: true,
      };
    }

    // Execute transactional activation
    const result = await activateQrTransaction({
      userId,
      qrCodeValue: code,
      businessData: sanitizedBusinessData,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    revalidatePath(`/q/${code}`);
    revalidatePath(`/activate/${code}`);

    return { success: true, code, businessName: result.qr?.businessName || businessName };
  } catch (error) {
    console.error('Error in activateQrAction:', error);
    return { success: false, error: error.message || 'Gagal aktivasi QR' };
  }
}

/**
 * Bulk Update QR Status (Admin Only)
 */
export async function bulkUpdateQrStatusAction(qrIds, newStatus) {
  try {
    await requireAdmin();
    if (!qrIds || !Array.isArray(qrIds) || qrIds.length === 0) {
      return { success: false, error: 'Tidak ada QR yang dipilih' };
    }

    const validStatuses = ['blank', 'sold', 'active', 'disabled'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Status baru tidak valid' };
    }

    const updated = await bulkUpdateQrStatus(qrIds, newStatus);

    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, count: updated.length };
  } catch (error) {
    console.error('Error in bulkUpdateQrStatusAction:', error);
    return { success: false, error: error.message || 'Gagal mengubah status massal' };
  }
}

/**
 * Bulk Delete QRs Permanently (Admin Only)
 */
export async function bulkDeleteQrsAction(qrIds) {
  try {
    await requireAdmin();
    if (!qrIds || !Array.isArray(qrIds) || qrIds.length === 0) {
      return { success: false, error: 'Tidak ada QR yang dipilih' };
    }

    const count = await bulkDeleteQrs(qrIds);

    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    return { success: true, count };
  } catch (error) {
    console.error('Error in bulkDeleteQrsAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus massal' };
  }
}

/**
 * Bulk Reset QRs back to 'blank' (Admin Only)
 */
export async function bulkResetQrsAction(qrIds) {
  try {
    await requireAdmin();
    if (!qrIds || !Array.isArray(qrIds) || qrIds.length === 0) {
      return { success: false, error: 'Tidak ada QR yang dipilih' };
    }

    const resetList = await bulkResetQrs(qrIds);

    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, count: resetList.length };
  } catch (error) {
    console.error('Error in bulkResetQrsAction:', error);
    return { success: false, error: error.message || 'Gagal mereset massal' };
  }
}

/**
 * Toggle or update single QR print status (Admin Only)
 */
export async function updateQrPrintStatusAction(qrId, isPrinted) {
  try {
    await requireAdmin();
    const updated = await updateQrPrintStatus(qrId, isPrinted);
    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    return { success: true, qr: updated };
  } catch (error) {
    console.error('Error in updateQrPrintStatusAction:', error);
    return { success: false, error: error.message || 'Gagal mengubah status cetak' };
  }
}

/**
 * Bulk update QR print status (Admin Only)
 */
export async function bulkUpdateQrPrintStatusAction(qrIds, isPrinted) {
  try {
    await requireAdmin();
    if (!qrIds || !Array.isArray(qrIds) || qrIds.length === 0) {
      return { success: false, error: 'Tidak ada QR yang dipilih' };
    }

    const updated = await bulkUpdateQrPrintStatus(qrIds, isPrinted);
    revalidatePath('/admin');
    revalidatePath('/admin/devices');
    return { success: true, count: updated.length };
  } catch (error) {
    console.error('Error in bulkUpdateQrPrintStatusAction:', error);
    return { success: false, error: error.message || 'Gagal mengubah status cetak massal' };
  }
}


/**
 * Customer Bulk Update Status: toggle between 'active' and 'disabled'
 * Authorizes user ownership on server
 */
export async function customerBulkUpdateStatusAction(qrIds, newStatus) {
  try {
    const session = await requireAuth();
    if (!qrIds || !Array.isArray(qrIds) || qrIds.length === 0) {
      return { success: false, error: 'Tidak ada perangkat yang dipilih' };
    }

    if (!['active', 'disabled'].includes(newStatus)) {
      return { success: false, error: 'Status hanya boleh Aktif atau Nonaktif' };
    }

    const updated = await customerBulkUpdateStatus(session.user.id, qrIds, newStatus);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, count: updated.length };
  } catch (error) {
    console.error('Error in customerBulkUpdateStatusAction:', error);
    return { success: false, error: error.message || 'Gagal mengubah status perangkat' };
  }
}

/**
 * Customer Bulk Unlink: removes selected devices from their account
 * Reverts devices back to unlinked 'blank'
 */
export async function customerBulkUnlinkAction(qrIds) {
  try {
    const session = await requireAuth();
    if (!qrIds || !Array.isArray(qrIds) || qrIds.length === 0) {
      return { success: false, error: 'Tidak ada perangkat yang dipilih' };
    }

    const unlinked = await customerBulkUnlink(session.user.id, qrIds);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/qr');
    return { success: true, count: unlinked.length };
  } catch (error) {
    console.error('Error in customerBulkUnlinkAction:', error);
    return { success: false, error: error.message || 'Gagal melepaskan perangkat dari akun' };
  }
}

/**
 * Update individual device configuration (Customer)
 */
export async function updateDeviceSettingsAction(prevState, formData) {
  try {
    const session = await requireAuth();
    const qrId = formData.get('qrId');
    const deviceName = (formData.get('deviceName') || '').toString().trim();
    const rawMapsUrl = (formData.get('googleMapsReviewUrl') || formData.get('googleMapsUrl') || '').toString().trim();

    // Checkbox: HTML only sends the value when checked. Absent = false.
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';

    const wifiName = (formData.get('wifiName') || '').toString().trim();
    const wifiUsername = (formData.get('wifiUsername') || '').toString().trim();
    const wifiPassword = (formData.get('wifiPassword') || '').toString().trim();

    if (!qrId) {
      return { success: false, error: 'ID Perangkat tidak valid' };
    }

    // googleMapsReviewUrl is optional at device level (empty = inherit from business)
    let normalizedMapsUrl = null;
    if (rawMapsUrl) {
      const mapsValidation = validateGoogleMapsUrl(rawMapsUrl);
      if (!mapsValidation.isValid) {
        return { success: false, error: mapsValidation.error, errors: { googleMapsReviewUrl: mapsValidation.error } };
      }
      normalizedMapsUrl = mapsValidation.normalized;
    }

    // Wifi validation only when enabled
    if (wifiEnabled) {
      if (!wifiName || wifiName.length < 1) {
        return { success: false, error: 'Nama Wi-Fi tidak boleh kosong jika fitur Wi-Fi aktif', errors: { wifiName: 'Nama Wi-Fi wajib diisi' } };
      }
      if (!wifiPassword || wifiPassword.length < 4) {
        return { success: false, error: 'Password Wi-Fi minimal 4 karakter', errors: { wifiPassword: 'Password Wi-Fi minimal 4 karakter' } };
      }
    }

    const { updateQrSettings } = await import('@/lib/db/queries/qr');
    
    await updateQrSettings(qrId, session.user.id, {
      deviceName: deviceName || null,
      googleMapsReviewUrl: normalizedMapsUrl,
      googleMapsUrl: normalizedMapsUrl,
      wifiEnabled,
      wifiName: wifiEnabled && wifiName ? wifiName : null,
      wifiUsername: wifiEnabled && wifiUsername ? wifiUsername : null,
      wifiPassword: wifiEnabled && wifiPassword ? wifiPassword : null,
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/devices');
    revalidatePath('/dashboard/qr');
    revalidatePath('/q/[code]', 'page');

    return { success: true, message: 'Pengaturan perangkat berhasil disimpan.' };
  } catch (error) {
    console.error('Error in updateDeviceSettingsAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan pengaturan perangkat' };
  }
}

/**
 * Track specific visitor actions on the scan page (e.g., clicking review, copying wifi)
 */
export async function trackVisitorAction(qrCode, actionType) {
  try {
    const qr = await getPublicQrByCode(qrCode);
    if (qr) {
      await recordScanLog(qr.id, 'Visitor Action', actionType);
      return { success: true };
    }
    return { success: false, error: 'QR not found' };
  } catch (error) {
    console.error('Failed to track action:', error);
    return { success: false, error: error.message };
  }
}
