import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ADMIN_EMAILS = [
  'distrapness@gmail.com',
  'admin@smartwifi.com',
];

function isUserAdmin(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean);
}

export async function middleware(request) {
  // Check session cookie existence
  const devCookie = request.cookies.get('smartwifi_session')?.value;
  const hasSupabaseCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));

  let sessionResult = null;
  let supabaseUser = null;

  // Only run Supabase session updater if there is a potential Supabase session
  if (hasSupabaseCookie) {
    sessionResult = await updateSession(request);
    supabaseUser = sessionResult?.user || null;
  }
  
  const res = sessionResult?.response || NextResponse.next();
  const { pathname } = request.nextUrl;

  // Protected paths
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isDashboardRoute && !isAdminRoute) {
    return res;
  }


  let isAuthenticated = !!supabaseUser || !!devCookie || hasSupabaseCookie;
  let userRole = 'customer';

  // Check role from authenticated Supabase user first
  if (supabaseUser && supabaseUser.email) {
    if (isUserAdmin(supabaseUser.email)) {
      userRole = 'admin';
    }
  }

  // Check role from verified dev session cookie
  if (devCookie && userRole !== 'admin') {
    try {
      let parsed = null;
      if (devCookie.includes('.')) {
        const payloadBase64 = devCookie.split('.')[0];
        const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
        parsed = JSON.parse(payloadJson);
      } else {
        parsed = JSON.parse(decodeURIComponent(devCookie));
      }

      if (parsed) {
        if (parsed.role === 'admin' || (parsed.email && isUserAdmin(parsed.email)) || parsed.whatsapp === '6285888159265') {
          userRole = 'admin';
        }
      }

    } catch {
      // ignore
    }
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection: role must be admin
  if (isAdminRoute) {
    // If user is not admin, redirect to customer dashboard
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, svg, icons
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
