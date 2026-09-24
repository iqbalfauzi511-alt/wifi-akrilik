import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AlertTriangle, ShieldOff, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { getPublicQrByCode, recordScanLog } from '@/lib/db/queries/qr';
import { validateGoogleMapsUrl } from '@/lib/utils/validation';
import VisitorScanExperience from '@/components/visitor/VisitorScanExperience';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { code } = params;
  return {
    title: `Cobascan: ${code}`,
    description: 'Cobascan: Google Review & akses bisnis.',
  };
}

export default async function VisitorQrPage({ params }) {
  const { code } = params;
  const qr = await getPublicQrByCode(code);

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
            Kode yang Anda akses (<span className="font-mono font-semibold">{code}</span>) tidak terdaftar pada sistem Cobascan.
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
              <Button size="lg" className="w-full">
                Aktivasi Sekarang
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Tentang Cobascan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: QR Active!
  // Record visitor scan asynchronously in scan_logs
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    await recordScanLog(qr.id, userAgent);
  } catch (err) {
    console.warn('Scan logging error (ignored):', err);
  }

  // Validate Google Maps Review URL
  const rawMapsUrl = (qr.googleMapsReviewUrl || qr.googleMapsUrl)?.trim();
  const mapsValidation = validateGoogleMapsUrl(rawMapsUrl);

  if (!mapsValidation.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bento-card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Google Maps Belum Dikonfigurasi</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Google Maps belum dikonfigurasi untuk bisnis ini.
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <VisitorScanExperience
        code={qr.code}
        businessName={qr.businessName}
        logoUrl={qr.logoUrl}
        googleMapsReviewUrl={mapsValidation.normalized}
        googleMapsUrl={mapsValidation.normalized}
        wifiEnabled={Boolean(qr.wifiEnabled)}
        wifiName={qr.wifiName || 'Wi-Fi Tamu'}
        wifiPassword={qr.wifiPassword || ''}
        whatsappNumber={qr.whatsappNumber || ''}
      />
    </div>
  );
}
