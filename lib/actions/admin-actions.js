'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { deleteBusinessAdmin, deleteUserAdmin } from '@/lib/db/queries/business';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';

/**
 * Permanently Delete a Business (Admin Only)
 * Unlinks associated QR codes and removes business profile.
 */
export async function deleteBusinessAction(businessId) {
  try {
    await requireAdmin();
    if (!businessId) {
      return { success: false, error: 'ID Bisnis tidak valid' };
    }

    const deleted = await deleteBusinessAdmin(businessId);
    if (!deleted) {
      return { success: false, error: 'Bisnis tidak ditemukan' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    revalidatePath('/admin/users');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteBusinessAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus bisnis' };
  }
}

/**
 * Permanently Delete a User Account (Admin Only)
 * Deletes user account and any associated businesses (unlinking their QRs).
 */
export async function deleteUserAction(userId) {
  try {
    const session = await requireAdmin();
    if (!userId) {
      return { success: false, error: 'ID Pengguna tidak valid' };
    }

    const result = await deleteUserAdmin(userId, session.user.id, session.user.email);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Tidak perlu lagi menghapus dari Supabase Auth karena otentikasi sudah sepenuhnya mandiri via database (WA+PIN).

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    revalidatePath('/admin/users');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteUserAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus pengguna' };
  }
}

/**
 * Reset User PIN to default (123456) or specified PIN and unlock account (Admin Only)
 */
export async function resetUserPinAction(userId, customPin = '123456') {
  try {
    const adminSession = await requireAdmin();
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'ID Pengguna tidak valid' };
    }

    const pinToSet = typeof customPin === 'string' ? customPin.trim() : '123456';
    if (!pinToSet || !/^\d{6}$/.test(pinToSet)) {
      return { success: false, error: 'PIN baru harus terdiri dari 6 angka' };
    }

    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!targetUser) {
      return { success: false, error: 'Pengguna tidak ditemukan' };
    }

    if (targetUser.role === 'admin' && targetUser.id !== adminSession.user.id) {
      return { success: false, error: 'Tidak dapat mereset PIN sesama Administrator' };
    }

    const newPinHash = hashPassword(pinToSet);
    
    await db.update(users)
      .set({
        pinHash: newPinHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath('/admin');
    revalidatePath('/admin/users');

    return { success: true, temporaryPin: pinToSet };
  } catch (error) {
    console.error('Error in resetUserPinAction:', error);
    return { success: false, error: error.message || 'Gagal mereset PIN' };
  }
}
