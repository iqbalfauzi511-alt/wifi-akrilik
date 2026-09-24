'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth/session';
import { deleteBusinessAdmin, deleteUserAdmin } from '@/lib/db/queries/business';

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
    return { success: true, business: deleted };
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

    const result = await deleteUserAdmin(userId, session.user.email);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Delete from Supabase Auth so they can't login again without registering
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (err) {
        console.warn('Failed to delete user from Supabase Auth:', err);
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/qr');
    revalidatePath('/admin/users');
    revalidatePath('/dashboard');
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error in deleteUserAction:', error);
    return { success: false, error: error.message || 'Gagal menghapus pengguna' };
  }
}
