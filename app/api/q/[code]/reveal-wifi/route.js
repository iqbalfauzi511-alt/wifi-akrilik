import { NextResponse } from 'next/server';
import { getQrWifiCredentials } from '@/lib/db/queries/qr';

export const dynamic = 'force-dynamic';

/**
 * POST /api/q/[code]/reveal-wifi
 * Secure Smart QR + NFC Wi-Fi reveal endpoint for visitors.
 * Strictly returns wifi_name and wifi_password ONLY upon request when wifi_enabled is true.
 * No user login, registration, or Google API check required.
 */
export async function POST(request, { params }) {
  try {
    const code = params?.code;
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'QR tidak ditemukan.' },
        { status: 404 }
      );
    }

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
