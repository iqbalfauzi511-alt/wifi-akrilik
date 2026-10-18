import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { verifySessionPayloadEdge } from '@/lib/auth/token-edge';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [])
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_WA = (process.env.ADMIN_WA || '').trim();

function isUserAdmin(email) {
  if (!email || ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function isUserAdminWa(wa) {
  if (!wa || !ADMIN_WA) return false;
  return wa.trim() === ADMIN_WA;
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

  // Cryptographically verify smartwifi_session before trusting existence or role
  let verifiedSession = null;
  if (devCookie) {
    verifiedSession = await verifySessionPayloadEdge(devCookie);
  }

  console.log('[DEBUG MIDDLEWARE]', pathname, { devCookie: !!devCookie, verifiedSession: !!verifiedSession });

  const isAuthenticated = Boolean(supabaseUser || verifiedSession);
  let userRole = 'customer';

  // Check role from authenticated Supabase user first
  if (supabaseUser?.email && isUserAdmin(supabaseUser.email)) {
    userRole = 'admin';
  }

  // Check role from cryptographically verified session
  if (verifiedSession && userRole !== 'admin') {
    if (
      verifiedSession.role === 'admin' ||
      (verifiedSession.email && isUserAdmin(verifiedSession.email)) ||
      (verifiedSession.whatsapp && isUserAdminWa(verifiedSession.whatsapp))
    ) {
      userRole = 'admin';
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
     * - sitemap.xml & robots.txt (search engine crawler files)
     * - images, svg, icons
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
