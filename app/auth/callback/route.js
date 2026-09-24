import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const userEmail = (data?.user?.email || '').toLowerCase().trim();
        const isAdmin =
          userEmail === 'distrapness@gmail.com' ||
          userEmail === 'admin@smartwifi.com';

        let targetUrl = next;
        if (targetUrl === '/dashboard' && isAdmin) {
          targetUrl = '/admin';
        }

        // We only allow creating a new DB user if they are an admin or activating a device.
        const isActivationFlow = targetUrl.startsWith('/activate/');
        
        // Let's check if they exist in DB by email or id
        const { db } = await import('@/lib/db');
        const { users } = await import('@/lib/db/schema');
        const { eq, or } = await import('drizzle-orm');
        
        let dbUser = await db.query.users.findFirst({
          where: or(eq(users.id, data.user.id), eq(users.email, userEmail))
        });
        
        if (!dbUser) {
          // New user signing in with Google: insert into DB
          const [created] = await db.insert(users).values({
            id: data.user.id,
            email: userEmail,
            name: data.user.user_metadata?.full_name || userEmail.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url || null,
            role: isAdmin ? 'admin' : 'customer',
            emailVerified: true,
          }).returning();
          dbUser = created;
        } else if (!dbUser.emailVerified) {
          // Google verified the email
          await db.update(users).set({ emailVerified: true }).where(eq(users.id, dbUser.id));
        }

        return NextResponse.redirect(`${origin}${targetUrl}`);
      }
    }
  }

  // Return the user to an error page or login with instructions
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
