import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const cookieStore = cookies();

  // Clear smartwifi_session on cookieStore
  try {
    cookieStore.delete({ name: 'smartwifi_session', path: '/' });
    cookieStore.set('smartwifi_session', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
    });
  } catch {}

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Explicitly clear smartwifi_session on response headers
  response.cookies.set('smartwifi_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  });

  // Clear all Supabase cookies (sb-*) and session cookies
  try {
    const allCookies = request.cookies.getAll();
    for (const c of allCookies) {
      if (c.name.startsWith('sb-') || c.name.includes('session') || c.name.includes('token')) {
        try {
          cookieStore.delete({ name: c.name, path: '/' });
          cookieStore.set(c.name, '', { path: '/', maxAge: 0, expires: new Date(0) });
        } catch {}
        response.cookies.set(c.name, '', {
          path: '/',
          maxAge: 0,
          expires: new Date(0),
        });
      }
    }
  } catch {}

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }

  return response;
}

export async function GET(request) {
  const res = await POST(request);
  const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
  
  // Copy Set-Cookie headers from logout POST response
  res.headers.forEach((val, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      redirectResponse.headers.append(key, val);
    }
  });

  return redirectResponse;
}
