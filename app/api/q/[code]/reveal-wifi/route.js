import { NextResponse } from 'next/server';
import { getQrWifiCredentials } from '@/lib/db/queries/qr';

export const dynamic = 'force-dynamic';

/**
 * POST /api/q/[code]/reveal-wifi
 * Secure Smart QR + NFC Wi-Fi reveal endpoint for visitors.
 * Strictly returns wifi_name and wifi_password ONLY upon request when wifi_enabled is true.
 * No user login, registration, or Google API check required.
 */
// In-memory sliding window rate limiter for Wi-Fi reveal protection
const rateLimitMap = new Map();

function isRateLimited(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean old entries periodically
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request, { params }) {
  try {
    const rawCode = params?.code;
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    // 1. Rate limiting check (max 10 reveal attempts per minute per IP)
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan. Silakan tunggu 1 menit lalu coba lagi.' },
        { status: 429 }
      );
    }

    // 2. Validate and sanitize code parameter
    if (!rawCode || typeof rawCode !== 'string' || rawCode.length > 64) {
      return NextResponse.json(
        { success: false, error: 'Kode QR tidak valid.' },
        { status: 400 }
      );
    }

    const code = rawCode.trim().toUpperCase().replace(/[\u2013\u2014]/g, '-');

    const result = await getQrWifiCredentials(code);

    if (result.error === 'notFound') {
      return NextResponse.json(
        { success: false, error: 'QR tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (result.error === 'inactive') {
      return NextResponse.json(
        { success: false, error: 'QR ini sedang tidak aktif.' },
        { status: 400 }
      );
    }

    if (result.error === 'noBusiness') {
      return NextResponse.json(
        { success: false, error: 'Data bisnis tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (result.error === 'wifiDisabled') {
      return NextResponse.json(
        { success: false, error: 'Fitur Wi-Fi tidak diaktifkan pada bisnis ini.' },
        { status: 400 }
      );
    }

    if (!result.success || !result.wifi_password) {
      return NextResponse.json(
        { success: false, error: 'Maaf, password Wi-Fi belum bisa ditampilkan. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wifi_name: result.wifi_name,
      wifi_password: result.wifi_password,
    });
  } catch (err) {
    console.error('API reveal-wifi error:', err);
    return NextResponse.json(
      { success: false, error: 'Maaf, password Wi-Fi belum bisa ditampilkan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
