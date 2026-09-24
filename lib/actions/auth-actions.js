'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signSessionPayload } from '@/lib/auth/token';
import { isUserAdmin } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

/**
 * Register New User (Pemilik Bisnis) with Email + Password
 * Mandatory Email Verification
 */
export async function registerWithEmailPasswordAction({ name, email, password }) {
  await ensureDatabaseInitialized();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { success: false, error: 'Alamat email tidak valid.' };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return { success: false, error: 'Password minimal terdiri dari 6 karakter.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = (name || cleanEmail.split('@')[0]).trim();
  const isAdmin = isUserAdmin(cleanEmail);
  const resolvedRole = isAdmin ? 'admin' : 'customer';

  // Check if email already registered
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, cleanEmail),
  });

  if (existingUser) {
    return {
      success: false,
      error: 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.',
      isRegistered: true,
    };
  }

  // Hash password
  const passwordHash = hashPassword(password);

  // If Supabase is connected, trigger Supabase auth signUp
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: { name: cleanName },
        },
      });
      if (error && !error.message.includes('already registered')) {
        console.warn('Supabase signUp warning:', error.message);
      }
    } catch (sbErr) {
      console.warn('Supabase signUp caught:', sbErr);
    }
  }

  // Insert into DB as unverified (emailVerified: false)
  const [newUser] = await db.insert(users).values({
    email: cleanEmail,
    name: cleanName,
    role: resolvedRole,
    passwordHash: passwordHash,
    emailVerified: false,
  }).returning();

  return {
    success: true,
    requireVerification: true,
    email: cleanEmail,
    message: `Pendaftaran berhasil. Link verifikasi telah dikirim ke ${cleanEmail}. Silakan verifikasi email Anda sebelum masuk.`,
  };
}

/**
 * Verify Email Action
 */
export async function verifyEmailAction(email, code) {
  await ensureDatabaseInitialized();
  if (!email) return { success: false, error: 'Email tidak valid.' };
  if (!code) return { success: false, error: 'Kode OTP tidak valid.' };

  const cleanEmail = email.toLowerCase().trim();
  const user = await db.query.users.findFirst({
    where: eq(users.email, cleanEmail),
  });

  if (!user) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }

  const supabase = createClient();
  if (supabase) {
    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: code,
      type: 'signup',
    });

    if (error) {
      return { success: false, error: 'Kode OTP salah atau kedaluwarsa. Silakan periksa kembali email Anda.' };
    }
  }

  await db.update(users).set({
    emailVerified: true,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  return { success: true, message: 'Email Anda berhasil diverifikasi. Silakan masuk.' };
}

/**
 * Login with Email + Password
 */
export async function loginWithEmailPasswordAction({ email, password, nextUrl }) {
  await ensureDatabaseInitialized();
  const cookieStore = cookies();

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
  const user = await db.query.users.findFirst({
    where: eq(users.email, cleanEmail),
  });

  if (!user) {
    return {
      success: false,
      error: 'Akun dengan email ini belum terdaftar. Silakan daftar terlebih dahulu.',
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
    return { success: false, error: 'Password yang Anda masukkan salah.' };
  }

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

  cookieStore.set('smartwifi_session', signedToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  let destination = nextUrl;
  if (!destination) {
    destination = resolvedRole === 'admin' ? '/admin' : '/dashboard';
  } else if (destination === '/dashboard' && resolvedRole === 'admin') {
    destination = '/admin';
  }

  return { success: true, redirectUrl: destination };
}

/**
 * Dev Quick Login for Demo Testing
 */
export async function devLoginAction({ email, name, nextUrl, allowSignup = false }) {
  await ensureDatabaseInitialized();
  const cookieStore = cookies();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Alamat email tidak valid');
  }

  const cleanEmail = email.toLowerCase().trim();
  const isAdmin = isUserAdmin(cleanEmail);
  const resolvedRole = isAdmin ? 'admin' : 'customer';

  let user = await db.query.users.findFirst({
    where: eq(users.email, cleanEmail),
  });

  if (!user) {
    if (!allowSignup && !isAdmin) {
      throw new Error('Akun dengan email ini belum terdaftar. Silakan aktivasi perangkat atau daftar akun terlebih dahulu.');
    }
    const [created] = await db.insert(users).values({
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: resolvedRole,
      emailVerified: true,
    }).returning();
    user = created;
  } else if (user.role !== resolvedRole) {
    const [updated] = await db.update(users).set({ role: resolvedRole }).where(eq(users.id, user.id)).returning();
    user = updated;
  }

  const signedToken = signSessionPayload({
    id: user.id,
    email: user.email,
    name: user.name,
    role: resolvedRole,
  });

  if (!signedToken) {
    throw new Error('Gagal membuat sesi login');
  }

  cookieStore.set('smartwifi_session', signedToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  if (nextUrl) {
    redirect(nextUrl);
  } else if (resolvedRole === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

/**
 * Complete Logout Action (Clear all sessions)
 */
export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete('smartwifi_session');

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

/**
 * Request Password Reset (Forgot Password)
 */
export async function requestPasswordResetAction(email) {
  if (!email) return { success: false, error: 'Email tidak valid.' };

  const cleanEmail = email.toLowerCase().trim();
  const supabase = createClient();
  if (!supabase) return { success: false, error: 'Sistem tidak terhubung ke Supabase.' };

  // Generate a redirect URL to our update-password page
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cobascan.my.id'}/auth/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.warn('Supabase reset password error:', error.message);
    return { success: false, error: 'Gagal mengirim email reset password. Pastikan email terdaftar.' };
  }

  return { success: true };
}

/**
 * Update Password (after Reset)
 */
export async function updatePasswordAction(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }

  const supabase = createClient();
  if (!supabase) return { success: false, error: 'Sistem tidak terhubung ke Supabase.' };

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { success: false, error: error.message || 'Gagal mengubah password.' };
  }

  // Sync password hash in our local DB if user exists locally
  if (data?.user?.email) {
    const cleanEmail = data.user.email.toLowerCase().trim();
    const newHash = hashPassword(newPassword);
    
    await ensureDatabaseInitialized();
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail)
    });
    
    if (user) {
      await db.update(users).set({
        passwordHash: newHash,
        updatedAt: new Date()
      }).where(eq(users.id, user.id));
    }
  }

  return { success: true };
}
