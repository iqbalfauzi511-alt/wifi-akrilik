'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/session';
import { updateBusinessDetails, upsertBusinessForOwner } from '@/lib/db/queries/business';
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
      return { success: false, error: 'Perubahan gagal disimpan. Silakan coba lagi.' };
    }

    // Revalidate dashboard and settings
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/qr');
    revalidatePath('/business/settings');

    // Revalidate each public QR for this business
    try {
      const qrs = await getQrsByBusinessId(session.business.id);
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
