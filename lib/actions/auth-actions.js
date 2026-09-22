'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signSessionPayload } from '@/lib/auth/token';
import { isUserAdmin } from '@/lib/auth/session';

/**
 * Dev / Demo Quick Login Action
 * Allows immediate testing of Admin and Customer roles
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

  // Find or insert user in DB
  let user = await db.query.users.findFirst({
    where: eq(users.email, cleanEmail),
  });

  if (!user) {
    if (!allowSignup && !isAdmin) {
      throw new Error('Akun dengan email ini belum terdaftar. Silakan aktivasi perangkat Anda terlebih dahulu jika Anda pengguna baru.');
    }
    const [created] = await db.insert(users).values({
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: resolvedRole,
    }).returning();
    user = created;
  } else if (user.role !== resolvedRole) {
    // Synchronize role strictly with admin whitelist
    const [updated] = await db.update(users).set({ role: resolvedRole }).where(eq(users.id, user.id)).returning();
    user = updated;
  }

  // Sign session token with cryptographic HMAC
  const signedToken = signSessionPayload({
    id: user.id,
    email: user.email,
    name: user.name,
    role: resolvedRole,
  });

  if (!signedToken) {
    throw new Error('Gagal membuat sesi login');
  }

  // Set session cookie
  cookieStore.set('smartwifi_session', signedToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
 * Logout Action
 */
export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete('smartwifi_session');

  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect('/login');
}
