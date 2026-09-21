import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get current authenticated user from Supabase session or dev session cookie
 * @returns {Promise<{ user: object|null, business: object|null, role: string|null }>}
 */
export async function getCurrentSession() {
  try {
    await ensureDatabaseInitialized();
  } catch (err) {
    console.warn('Database initialization caught in session resolver:', err?.message || err);
  }
  const cookieStore = cookies();

  // 1. Check Supabase Auth
  const supabase = createClient();
  if (supabase) {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (authUser && !error) {
        // Find or create in users table
        let dbUser = await db.query.users.findFirst({
          where: eq(users.id, authUser.id),
        });

        if (!dbUser) {
          // Check if admin by email or default role
          const role = authUser.email.includes('admin') ? 'admin' : 'customer';
          const [newUser] = await db.insert(users).values({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            avatarUrl: authUser.user_metadata?.avatar_url || null,
            role,
          }).returning();
          dbUser = newUser;
        }

        // Fetch user's business
        const business = await db.query.businesses.findFirst({
          where: eq(businesses.ownerId, dbUser.id),
        });

        return {
          user: dbUser,
          business: business || null,
          role: dbUser.role,
        };
      }
    } catch (err) {
      console.warn('Supabase auth session error:', err);
    }
  }

  // 2. Check local dev/test session cookie (for seamless testing/demo)
  const devSessionCookie = cookieStore.get('smartwifi_session');
  if (devSessionCookie && devSessionCookie.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(devSessionCookie.value));
      if (parsed && parsed.email) {
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, parsed.email),
        });

        if (!dbUser) {
          const [newUser] = await db.insert(users).values({
            id: parsed.id || undefined,
            email: parsed.email,
            name: parsed.name || parsed.email.split('@')[0],
            avatarUrl: parsed.avatarUrl || null,
            role: parsed.role || 'customer',
          }).returning();
          dbUser = newUser;
        }

        const business = await db.query.businesses.findFirst({
          where: eq(businesses.ownerId, dbUser.id),
        });

        return {
          user: dbUser,
          business: business || null,
          role: dbUser.role,
        };
      }
    } catch (e) {
      console.warn('Failed to parse dev session cookie:', e);
    }
  }

  return {
    user: null,
    business: null,
    role: null,
  };
}

/**
 * Require authenticated user or throw/redirect
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session.user) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

/**
 * Require admin role or throw/redirect
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== 'admin') {
    throw new Error('FORBIDDEN_NOT_ADMIN');
  }
  return session;
}
