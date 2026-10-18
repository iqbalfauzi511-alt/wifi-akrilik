'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signSessionPayload } from '@/lib/auth/token';
import { isUserAdmin } from '@/lib/auth/session';
import { hashPassword, verifyPassword, needsRehash } from '@/lib/auth/password';
import { safeRedirectUrl } from '@/lib/utils/validation';

/**
 * Login with Email + Password
 */
export async function loginWithEmailPasswordAction({ email, password, nextUrl }) {
  await ensureDatabaseInitialized();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { success: false, error: 'Silakan masukkan alamat email yang valid.' };
  }

  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Silakan masukkan password Anda.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const isAdmin = isUserAdmin(cleanEmail);
  const resolvedRole = isAdmin ? 'admin' : 'customer';

  // Find user
  let user = await db.query.users.findFirst({
    where: eq(users.email, cleanEmail),
  });

  if (!user) {
    return {
      success: false,
      error: 'Akun dengan email ini belum terdaftar. Silakan hubungi administrator atau daftar akun baru.',
    };
  }

  // Enforce Email Verification (Requirement: "wajib verifikasi email")
  if (!user.emailVerified && !isAdmin) {
    return {
      success: false,
      requireVerification: true,
      email: cleanEmail,
      error: 'Email Anda belum diverifikasi. Silakan periksa inbox atau spam email Anda untuk mengaktifkan akun.',
    };
  }

  // Lockout protection against brute force attacks
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 15;

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    return {
      success: false,
      error: `Akun terkunci sementara karena 5 kali salah password. Silakan coba lagi dalam ${remainingMinutes} menit.`,
    };
  }

  // Verify password
  let isPasswordValid = false;

  // 1. Check native password hash
  if (user.passwordHash) {
    isPasswordValid = verifyPassword(password, user.passwordHash);
  } else {
    // Akun ini terdaftar via Google / Auth provider lain dan belum punya password
    // Coba fallback Supabase jika dikonfigurasi
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (!error && data?.user) {
          isPasswordValid = true;
        }
      } catch {
        // ignore
      }
    }

    if (!isPasswordValid) {
       return { 
         success: false, 
         error: 'Akun Anda sebelumnya terdaftar menggunakan Google. Silakan klik tombol "Lanjutkan dengan Google" di atas untuk masuk.' 
       };
    }
  }

  // 2. Fallback to Supabase password verification if available (for users with passwordHash but maybe mismatched, though unlikely)
  if (!isPasswordValid && user.passwordHash) {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (!error && data?.user) {
          isPasswordValid = true;
        }
      } catch {
        // ignore
      }
    }
  }

  if (!isPasswordValid) {
    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData = { failedLoginAttempts: newAttempts, updatedAt: new Date() };

    if (newAttempts >= MAX_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      await db.update(users).set(updateData).where(eq(users.id, user.id));
      return {
        success: false,
        error: `Password salah 5 kali berturut-turut. Akun dikunci sementara selama ${LOCKOUT_MINUTES} menit demi keamanan.`,
      };
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));
    return {
      success: false,
      error: `Password salah. Tersisa ${MAX_ATTEMPTS - newAttempts} percobaan sebelum akun terkunci.`,
    };
  }

  // Reset failed attempts on success and upgrade hash to 210,000 iterations if needed
  const resetData = { failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() };
  if (needsRehash(user.passwordHash)) {
    resetData.passwordHash = hashPassword(password);
  }
  await db.update(users).set(resetData).where(eq(users.id, user.id));

  // Sign session token
  const signedToken = signSessionPayload({
    id: user.id,
    email: user.email,
    name: user.name,
    role: resolvedRole,
  });

  if (!signedToken) {
    return { success: false, error: 'Gagal membuat sesi login.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('smartwifi_session', signedToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const defaultDestination = resolvedRole === 'admin' ? '/admin' : '/dashboard';
  const targetDestination = safeRedirectUrl(nextUrl, defaultDestination);
  const finalDestination =
    targetDestination === '/dashboard' && resolvedRole === 'admin' ? '/admin' : targetDestination;

  return { success: true, redirectUrl: finalDestination };
}

/**
 * Complete Logout Action (Clear all sessions)
 */
export async function logoutAction() {
  const cookieStore = cookies();
  try {
    cookieStore.delete({ name: 'smartwifi_session', path: '/' });
    cookieStore.set('smartwifi_session', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
  } catch {}

  try {
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.startsWith('sb-') || c.name.includes('session') || c.name.includes('token')) {
        try {
          cookieStore.delete({ name: c.name, path: '/' });
          cookieStore.set(c.name, '', {
            path: '/',
            maxAge: 0,
            expires: new Date(0),
          });
        } catch {}
      }
    }
  } catch {}

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  redirect('/login');
}
