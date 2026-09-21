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
        return NextResponse.redirect(`${origin}${targetUrl}`);
      }
    }
  }

  // Return the user to an error page or login with instructions
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
