'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Dev / Demo Quick Login Action
 * Allows immediate testing of Admin and Customer roles
 */
export async function devLoginAction({ email, name, role, nextUrl }) {
  await ensureDatabaseInitialized();
  const cookieStore = cookies();

  // Find or insert user in DB
  let user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });

  if (!user) {
    const [created] = await db.insert(users).values({
      email: email.toLowerCase().trim(),
      name,
      role: role || 'customer',
    }).returning();
    user = created;
  } else if (user.role !== role) {
    // Update role if changed
    const [updated] = await db.update(users).set({ role }).where(eq(users.id, user.id)).returning();
    user = updated;
  }

  // Set session cookie
  cookieStore.set('smartwifi_session', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax',
  });

  if (nextUrl) {
    redirect(nextUrl);
  } else if (user.role === 'admin') {
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
