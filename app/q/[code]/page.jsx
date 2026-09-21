import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Wifi, AlertTriangle, ShieldOff, Sparkles, ArrowRight } from 'lucide-react';
import { getPublicQrByCode, recordScanLog } from '@/lib/db/queries/qr';
import VisitorScanExperience from '@/components/visitor/VisitorScanExperience';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { code } = params;
  return {
    title: `Smart QR & NFC — ${code}`,
    description: 'Beri rating Google Maps dan akses Wi-Fi bisnis.',
  };
}

export default async function VisitorQrPage({ params }) {
  const { code } = params;
  const qr = await getPublicQrByCode(code);

  // Case 1: QR not found
  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">QR Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR / NFC Code yang Anda akses (<span className="font-mono font-semibold">{code}</span>) tidak terdaftar pada sistem Smart QR.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: QR disabled by admin
  if (qr.status === 'disabled') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">QR Tidak Aktif</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR / NFC ini sedang dinonaktifkan. Silakan hubungi pemilik bisnis.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Case 3: QR Blank or Sold (Unactivated)
  if (qr.status === 'blank' || qr.status === 'sold') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          {qr.batchCode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold mb-2">
              <span>Paket: {qr.batchCode}</span>
            </div>
          )}
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">QR Belum Diaktifkan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR / NFC ini belum diaktifkan. Jika Anda pemilik produk, silakan lakukan aktivasi bisnis.
          </p>
          <div className="space-y-3">
            <Link href={`/activate/${code}`}>
              <Button size="lg" className="w-full shadow-md shadow-brand-600/20">
                Aktivasi Sekarang
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Tentang Smart QR + NFC
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: QR Active!
  // Record visitor scan asynchronously in scan_logs (safely ignored if fails)
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    await recordScanLog(qr.id, userAgent);
  } catch (err) {
    console.warn('Scan logging error (ignored):', err);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6 sm:py-12 bg-slate-100/70">
      <VisitorScanExperience
        code={qr.code}
        businessName={qr.businessName || 'Bisnis Anda'}
        googleMapsUrl={qr.googleMapsUrl || ''}
        wifiEnabled={Boolean(qr.wifiEnabled)}
        wifiName={qr.wifiName || 'Wi-Fi Tamu'}
      />
    </div>
  );
}
