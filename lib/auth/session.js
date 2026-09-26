import { cookies } from 'next/headers';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionPayload } from './token.js';

export const ADMIN_EMAILS = [
  'distrapness@gmail.com',
  'admin@smartwifi.com',
];

export const ADMIN_WA = '6285888159265';

export function isUserAdmin(email) {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(cleanEmail);
}

export function isUserAdminWa(wa) {
  if (!wa) return false;
  return wa === ADMIN_WA;
}


/**
 * Get current authenticated user from Supabase session or dev session cookie
 * @returns {Promise<{ user: object|null, business: object|null, role: string|null }>}
 */
export const getCurrentSession = cache(async () => {
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

        // Find user by Supabase Auth ID first, then fall back to email
        let dbUser = await db.query.users.findFirst({
          where: eq(users.id, authUser.id),
        });

        if (!dbUser && userEmail) {
          // Fallback: find by email (user may have registered via email/password first)
          const byEmail = await db.query.users.findFirst({
            where: eq(users.email, userEmail),
          });
          if (byEmail) {
            // Sync the Supabase Auth ID into our users table so next lookup by ID works
            const [synced] = await db
              .update(users)
              .set({ id: authUser.id, emailVerified: true, avatarUrl: byEmail.avatarUrl || authUser.user_metadata?.avatar_url || null })
              .where(eq(users.email, userEmail))
              .returning();
            dbUser = synced;
          }
        }

        if (!dbUser) {
          // Brand-new Google user with no prior record — create now
          // (allows activation flow: user arrived here via /activate/[code])
          const [created] = await db.insert(users).values({
            id: authUser.id,
            email: userEmail,
            name: authUser.user_metadata?.full_name || userEmail.split('@')[0],
            avatarUrl: authUser.user_metadata?.avatar_url || null,
            role: resolvedRole,
            emailVerified: true,
          }).returning();
          dbUser = created;
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

  // 2. Check local session cookie (cryptographically signed HMAC token)
  // Used for: Owner (WA+PIN login) AND Admin (email/password dev login)
  const devSessionCookie = cookieStore.get('smartwifi_session');
  if (devSessionCookie && devSessionCookie.value) {
    try {
      const parsed = verifySessionPayload(devSessionCookie.value);
      if (parsed && (parsed.email || parsed.whatsapp)) {
        let dbUser = null;

        // Owner session: lookup by whatsapp_number first
        if (parsed.whatsapp) {
          dbUser = await db.query.users.findFirst({
            where: eq(users.whatsappNumber, parsed.whatsapp),
          });
        }

        // Admin/email session: lookup by email
        if (!dbUser && parsed.email && !parsed.email.includes('@owner.cobascan.local')) {
          const userEmail = parsed.email.toLowerCase().trim();
          dbUser = await db.query.users.findFirst({
            where: eq(users.email, userEmail),
          });
        }

        // Lookup by ID as fallback
        if (!dbUser && parsed.id) {
          dbUser = await db.query.users.findFirst({
            where: eq(users.id, parsed.id),
          });
        }

        // Create admin record if not found (dev login edge case)
        if (!dbUser && parsed.email && isUserAdmin(parsed.email)) {
          const [newUser] = await db.insert(users).values({
            id: parsed.id || undefined,
            email: parsed.email.toLowerCase().trim(),
            name: parsed.name || parsed.email.split('@')[0],
            avatarUrl: parsed.avatarUrl || null,
            role: 'admin',
            emailVerified: true,
          }).returning();
          dbUser = newUser;
        }

        if (!dbUser) {
          return { user: null, business: null, businesses: [], role: null };
        }

        const actualRole = isUserAdmin(dbUser.email) ? 'admin' : (dbUser.role || 'customer');
        if (dbUser.role !== actualRole) {
          const [updated] = await db
            .update(users)
            .set({ role: actualRole })
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
          role: actualRole,
        };
      }
    } catch (e) {
      console.warn('Failed to verify session cookie:', e);
    }
  }

  return {
    user: null,
    business: null,
    businesses: [],
    role: null,
  };
});


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
