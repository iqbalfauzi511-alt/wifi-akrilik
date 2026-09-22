import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionPayload } from './token.js';

export const ADMIN_EMAILS = [
  'distrapness@gmail.com',
  'admin@smartwifi.com',
];

export function isUserAdmin(email) {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith('admin@');
}

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
        const userEmail = (authUser.email || '').toLowerCase().trim();
        const isAdmin = isUserAdmin(userEmail);
        const resolvedRole = isAdmin ? 'admin' : 'customer';

        // Find or create in users table
        let dbUser = await db.query.users.findFirst({
          where: eq(users.id, authUser.id),
        });

        if (!dbUser) {
          // DO NOT auto-create users unless they explicitly signed up via activation or dev login.
          // This prevents random Google accounts from accessing the dashboard.
          return { user: null, business: null, role: null };
        } else if (dbUser.role !== resolvedRole) {
          // Guarantee role is strictly synchronized with whitelist
          const [updated] = await db
            .update(users)
            .set({ role: resolvedRole })
            .where(eq(users.id, dbUser.id))
            .returning();
          dbUser = updated;
        }

        // Fetch user's businesses
        const userBusinesses = await db.query.businesses.findMany({
          where: eq(businesses.ownerId, dbUser.id),
          orderBy: (businesses, { desc }) => [desc(businesses.createdAt)],
        });

        return {
          user: dbUser,
          business: userBusinesses[0] || null,
          businesses: userBusinesses || [],
          role: resolvedRole,
        };
      }
    } catch (err) {
      console.warn('Supabase auth session error:', err);
    }
  }

  // 2. Check local dev/test session cookie (cryptographically verified HMAC token)
  const devSessionCookie = cookieStore.get('smartwifi_session');
  if (devSessionCookie && devSessionCookie.value) {
    try {
      const parsed = verifySessionPayload(devSessionCookie.value);
      if (parsed && parsed.email) {
        const userEmail = parsed.email.toLowerCase().trim();
        const isAdmin = isUserAdmin(userEmail);
        const resolvedRole = isAdmin ? 'admin' : 'customer';

        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, userEmail),
        });

        if (!dbUser) {
          const [newUser] = await db.insert(users).values({
            id: parsed.id || undefined,
            email: userEmail,
            name: parsed.name || userEmail.split('@')[0],
            avatarUrl: parsed.avatarUrl || null,
            role: resolvedRole,
          }).returning();
          dbUser = newUser;
        } else if (dbUser.role !== resolvedRole) {
          const [updated] = await db
            .update(users)
            .set({ role: resolvedRole })
            .where(eq(users.id, dbUser.id))
            .returning();
          dbUser = updated;
        }

        const userBusinesses = await db.query.businesses.findMany({
          where: eq(businesses.ownerId, dbUser.id),
          orderBy: (businesses, { desc }) => [desc(businesses.createdAt)],
        });

        return {
          user: dbUser,
          business: userBusinesses[0] || null,
          businesses: userBusinesses || [],
          role: resolvedRole,
        };
      }
    } catch (e) {
      console.warn('Failed to verify dev session cookie:', e);
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
