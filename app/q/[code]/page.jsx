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
    title: `Cobascan — ${code}`,
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
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
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
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
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
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
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
  // 1. Record visitor scan asynchronously in scan_logs (safely ignored if fails)
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    await recordScanLog(qr.id, userAgent);
  } catch (err) {
    console.warn('Scan logging error (ignored):', err);
  }

  // 2. Validate Google Maps Review URL (strict database URL only, no query params)
  const rawMapsUrl = (qr.googleMapsReviewUrl || qr.googleMapsUrl)?.trim();
  const mapsValidation = validateGoogleMapsUrl(rawMapsUrl);

  if (!mapsValidation.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
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

  // 3. Conditional behavior based on business configuration:
  // JIKA MEMILIH WI-FI (wifi_enabled === true) ->
  // Tampilkan halaman review-gate: pengunjung klik untuk beri review Google Maps, lalu kembali untuk melihat password Wi-Fi.
  if (qr.wifiEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <VisitorScanExperience
          code={qr.code}
          businessName={qr.businessName}
          logoUrl={qr.logoUrl}
          googleMapsReviewUrl={mapsValidation.normalized}
          googleMapsUrl={mapsValidation.normalized}
          wifiEnabled={true}
          wifiName={qr.wifiName}
        />
      </div>
    );
  }

  // JIKA HANYA MEMILIH MAPS (wifi_enabled === false) ->
  // Langsung direct redirect 100% otomatis ke Google Maps Review URL!
  redirect(mapsValidation.normalized);
}
