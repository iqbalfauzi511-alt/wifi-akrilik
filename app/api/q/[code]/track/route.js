import { NextResponse } from 'next/server';
import { getPublicQrByCode, recordScanLog } from '@/lib/db/queries/qr';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const rawCode = params?.code;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'page_view';
    const redirectUrl = searchParams.get('url');

    if (rawCode) {
      const code = rawCode.trim().toUpperCase().replace(/[\u2013\u2014\u2212]/g, '-');
      const qr = await getPublicQrByCode(code);
      
      if (qr) {
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
        await recordScanLog(qr.id, `Visitor IP: ${clientIp}`, action);
      }
    }

    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tracking API error:', err);
    // If error occurs, still try to redirect so user experience isn't broken
    const redirectUrl = new URL(request.url).searchParams.get('url');
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
