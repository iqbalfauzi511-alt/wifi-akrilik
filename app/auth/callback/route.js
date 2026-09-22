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
          userEmail === 'admin@smartwifi.com' ||
          userEmail.startsWith('admin@');

        let targetUrl = next;
        if (targetUrl === '/dashboard' && isAdmin) {
          targetUrl = '/admin';
        }

        // We only allow creating a new DB user if they are an admin or activating a device.
        const isActivationFlow = targetUrl.startsWith('/activate/');
        
        // Let's check if they exist in DB
        const { db } = await import('@/lib/db');
        const { users } = await import('@/lib/db/schema');
        const { eq } = await import('drizzle-orm');
        
        let dbUser = await db.query.users.findFirst({
          where: eq(users.id, data.user.id)
        });
        
        if (!dbUser) {
          if (!isActivationFlow && !isAdmin) {
            // Sign them out of Supabase because they aren't registered
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/login?error=unregistered_email`);
          }
          
          // Permitted to register: Insert them into our DB
          await db.insert(users).values({
            id: data.user.id,
            email: userEmail,
            name: data.user.user_metadata?.full_name || userEmail.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url || null,
            role: isAdmin ? 'admin' : 'customer',
          });
        }

        return NextResponse.redirect(`${origin}${targetUrl}`);
      }
    }
  }

  // Return the user to an error page or login with instructions
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
