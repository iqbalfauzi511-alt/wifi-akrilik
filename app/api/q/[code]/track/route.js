import { NextResponse } from 'next/server';
import { getPublicQrByCode, recordScanLog } from '@/lib/db/queries/qr';
import { validateGoogleMapsUrl, safeRedirectUrl } from '@/lib/utils/validation.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const rawCode = params?.code;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'page_view';
    const redirectUrl = searchParams.get('url');

    let qr = null;
    let safeFallbackUrl = '/';

    if (rawCode) {
      const code = rawCode.trim().toUpperCase().replace(/[\u2013\u2014\u2212]/g, '-');
      safeFallbackUrl = `/q/${code}`;
      qr = await getPublicQrByCode(code);
      
      if (qr) {
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
        await recordScanLog(qr.id, `Visitor IP: ${clientIp}`, action);
      }
    }

    if (redirectUrl) {
      // 1. Strict Google Maps / Review URL validation
      const val = validateGoogleMapsUrl(redirectUrl);
      if (val.isValid) {
        return NextResponse.redirect(val.normalized);
      }

      // 2. Safe relative internal path check
      const safeInternal = safeRedirectUrl(redirectUrl, null);
      if (safeInternal) {
        return NextResponse.redirect(new URL(safeInternal, request.url));
      }

      // 3. Fallback: If QR has a configured google review URL, redirect there
      const configuredReviewUrl = (qr?.googleMapsReviewUrl || qr?.googleMapsUrl)?.trim();
      if (configuredReviewUrl && validateGoogleMapsUrl(configuredReviewUrl).isValid) {
        return NextResponse.redirect(configuredReviewUrl);
      }

      // 4. Safe fallback to QR experience page
      return NextResponse.redirect(new URL(safeFallbackUrl, request.url));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
