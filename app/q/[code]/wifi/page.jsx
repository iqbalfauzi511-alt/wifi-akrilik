import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { AlertTriangle, ShieldOff, Sparkles, ArrowRight, WifiOff, Star, ExternalLink } from 'lucide-react';
import { getPublicQrByCode, recordScanLog } from '@/lib/db/queries/qr';
import VisitorScanExperience from '@/components/visitor/VisitorScanExperience';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { code } = params;
  return {
    title: `Cobascan Wi-Fi: ${code}`,
    description: 'Cobascan: Berikan ulasan Google Maps untuk mendapatkan akses password Wi-Fi.',
  };
}

export default async function VisitorWifiPage({ params }) {
  const { code } = params;
  const normalizedCode = code?.trim().toUpperCase().replace(/[\u2013\u2014]/g, '-') || '';
  const qr = await getPublicQrByCode(normalizedCode);

  // Case 1: QR not found
  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bento-card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Cobascan Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Kode yang Anda akses (<span className="font-mono font-semibold">{normalizedCode}</span>) tidak terdaftar pada sistem Cobascan.
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
        <div className="max-w-md w-full bento-card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">QR Tidak Aktif</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR Code ini sedang dinonaktifkan. Silakan hubungi pemilik bisnis.
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
        <div className="max-w-md w-full bento-card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          {qr.batchCode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold mb-2">
              <span>Paket: {qr.batchCode}</span>
            </div>
          )}
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Cobascan Belum Diaktifkan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR Code ini belum diaktifkan. Jika Anda pemilik bisnis, silakan lakukan aktivasi.
          </p>
          <div className="space-y-3">
            <Link href={`/activate/${code}`}>
              <Button size="lg" className="w-full shadow-md shadow-brand-600/20">
                Aktivasi Sekarang
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Log scan asynchronously
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    await recordScanLog(qr.id, userAgent);
  } catch (err) {
    console.warn('Scan logging error (ignored):', err);
  }

  const targetMapsUrl = (qr.googleMapsReviewUrl || qr.googleMapsUrl)?.trim() || 'https://maps.google.com/';

  // Case 4: QR Active but Wi-Fi disabled
  if (!qr.wifiEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bento-card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Wi-Fi Tidak Tersedia</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Bisnis <strong>{qr.businessName}</strong> saat ini tidak menyediakan akses Wi-Fi publik. Namun Anda tetap dapat mendukung dengan memberikan ulasan di Google Maps!
          </p>
          <a
            href={targetMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white py-3 px-5 shadow-md shadow-blue-500/20 text-sm"
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Beri Rating di Google Maps</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>
      </div>
    );
  }

  // Case 5: Wi-Fi Enabled -> Review-to-reveal Wi-Fi Experience!
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <VisitorScanExperience
        code={qr.code}
        businessName={qr.businessName}
        logoUrl={qr.logoUrl}
        googleMapsReviewUrl={qr.googleMapsReviewUrl || qr.googleMapsUrl}
        googleMapsUrl={qr.googleMapsUrl}
        wifiEnabled={true}
        wifiName={qr.wifiName}
      />
    </div>
  );
}
