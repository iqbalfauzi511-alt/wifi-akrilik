'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/session';
import { updateBusinessDetails, upsertBusinessForOwner, createBusinessBranch } from '@/lib/db/queries/business';
import { getQrsByBusinessId } from '@/lib/db/queries/qr';
import { validateBusinessInput } from '@/lib/utils/validation';

/**
 * Update Customer Business Settings & Wi-Fi Password
 */
export async function updateBusinessWifiAction(prevState, formData) {
  try {
    const session = await requireAuth();
    if (!session.business) {
      return { success: false, error: 'Bisnis belum terdaftar' };
    }

    const businessName = formData.get('businessName');
    const googleMapsReviewUrl = (formData.get('googleMapsReviewUrl') || formData.get('googleMapsUrl') || '').toString().trim();
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';
    const logoUrl = formData.get('logoUrl');
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');

    const validation = validateBusinessInput({
      businessName,
      logoUrl: logoUrl !== null ? logoUrl.toString().trim() : undefined,
      googleMapsReviewUrl,
      googleMapsUrl: googleMapsReviewUrl,
      wifiEnabled,
      wifiName,
      wifiPassword,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError, errors: validation.errors };
    }

    const targetBizId = formData.get('businessId') || session.business?.id;
    if (!targetBizId) {
      return { success: false, error: 'Bisnis tidak ditemukan' };
    }

    let cleanWhatsapp = (formData.get('whatsappNumber') || formData.get('whatsapp') || '').toString().trim().replace(/[^0-9]/g, '');
    if (cleanWhatsapp.startsWith('0')) {
      cleanWhatsapp = '62' + cleanWhatsapp.substring(1);
    } else if (cleanWhatsapp && !cleanWhatsapp.startsWith('62')) {
      cleanWhatsapp = '62' + cleanWhatsapp;
    }

    const updated = await updateBusinessDetails(targetBizId, session.user.id, {
      ...validation.sanitized,
      whatsappNumber: cleanWhatsapp || null,
    });

    if (!updated) {
      return { success: false, error: 'Perubahan gagal disimpan. Silakan coba lagi.' };
    }

    // Revalidate dashboard and settings
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/qr');
    revalidatePath('/business/settings');

    // Revalidate each public QR for this business
    try {
      const qrs = await getQrsByBusinessId(targetBizId);
      for (const qr of qrs) {
        revalidatePath(`/q/${qr.code}`);
      }
    } catch (revalErr) {
      console.warn('QR cache revalidation notice:', revalErr);
    }
    revalidatePath('/q/[code]', 'page');

    return { success: true, message: '✓ Perubahan berhasil disimpan.' };
  } catch (error) {
    console.error('Error in updateBusinessWifiAction:', error);
    return { success: false, error: 'Perubahan gagal disimpan. Silakan coba lagi.' };
  }
}

/**
 * Direct Update Business Settings Helper
 */
export async function updateBusinessSettingsAction(businessId, settings) {
  try {
    const session = await requireAuth();
    if (!businessId) {
      return { success: false, error: 'ID Bisnis diperlukan' };
    }

    const updated = await updateBusinessDetails(businessId, session.user.id, settings);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/wifi');
    revalidatePath('/dashboard/settings');
    return { success: true, business: updated };
  } catch (error) {
    console.error('Error in updateBusinessSettingsAction:', error);
    return { success: false, error: error.message || 'Gagal memperbarui pengaturan' };
  }
}

/**
 * Initial Business Setup (if user visited /dashboard/setup without QR)
 */
export async function setupBusinessAction(prevState, formData) {
  try {
    const session = await requireAuth();

    const businessName = formData.get('businessName');
    const googleMapsReviewUrl = (formData.get('googleMapsReviewUrl') || formData.get('googleMapsUrl') || '').toString().trim();
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';
    const logoUrl = formData.get('logoUrl');
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');

    const validation = validateBusinessInput({
      businessName,
      logoUrl: logoUrl !== null ? logoUrl.toString().trim() : undefined,
      googleMapsReviewUrl,
      googleMapsUrl: googleMapsReviewUrl,
      wifiEnabled,
      wifiName,
      wifiPassword,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError, errors: validation.errors };
    }

    const business = await upsertBusinessForOwner(session.user.id, validation.sanitized);

    revalidatePath('/dashboard');
    return { success: true, businessId: business.id };
  } catch (error) {
    console.error('Error in setupBusinessAction:', error);
    return { success: false, error: error.message || 'Gagal menyimpan profil bisnis' };
  }
}

/**
 * Create a brand new Store / Branch for the authenticated customer
 */
export async function createBusinessBranchAction(prevState, formData) {
  try {
    const session = await requireAuth();

    const businessName = formData.get('businessName');
    const googleMapsReviewUrl = (formData.get('googleMapsReviewUrl') || formData.get('googleMapsUrl') || '').toString().trim();
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';
    const logoUrl = formData.get('logoUrl');
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');

    const validation = validateBusinessInput({
      businessName,
      logoUrl: logoUrl !== null ? logoUrl.toString().trim() : undefined,
      googleMapsReviewUrl,
      googleMapsUrl: googleMapsReviewUrl,
      wifiEnabled,
      wifiName,
      wifiPassword,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError, errors: validation.errors };
    }

    const newBranch = await createBusinessBranch(session.user.id, validation.sanitized);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/qr');

    return {
      success: true,
      message: `✓ Toko/Cabang "${newBranch.businessName}" berhasil ditambahkan!`,
      branch: newBranch,
    };
  } catch (error) {
    console.error('Error in createBusinessBranchAction:', error);
    return { success: false, error: error.message || 'Gagal menambahkan cabang baru' };
  }
}
