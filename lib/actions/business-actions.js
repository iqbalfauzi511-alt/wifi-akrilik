'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/session';
import { updateBusinessDetails, upsertBusinessForOwner } from '@/lib/db/queries/business';
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
    const googleMapsUrl = formData.get('googleMapsUrl');
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');
    const instagramUrl = formData.get('instagramUrl');

    const validation = validateBusinessInput({
      businessName,
      googleMapsUrl,
      wifiEnabled,
      wifiName,
      wifiPassword,
      instagramUrl,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError, errors: validation.errors };
    }

    const updated = await updateBusinessDetails(session.business.id, session.user.id, validation.sanitized);

    if (!updated) {
      return { success: false, error: 'Gagal memperbarui data bisnis' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/qr');
    return { success: true, message: 'Pengaturan Smart QR + NFC berhasil diperbarui!' };
  } catch (error) {
    console.error('Error in updateBusinessWifiAction:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan sistem' };
  }
}

/**
 * Initial Business Setup (if user visited /dashboard/setup without QR)
 */
export async function setupBusinessAction(prevState, formData) {
  try {
    const session = await requireAuth();

    const businessName = formData.get('businessName');
    const googleMapsUrl = formData.get('googleMapsUrl');
    const wifiEnabledRaw = formData.get('wifiEnabled');
    const wifiEnabled = wifiEnabledRaw === 'true' || wifiEnabledRaw === 'on' || wifiEnabledRaw === '1';
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');
    const instagramUrl = formData.get('instagramUrl');

    const validation = validateBusinessInput({
      businessName,
      googleMapsUrl,
      wifiEnabled,
      wifiName,
      wifiPassword,
      instagramUrl,
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
