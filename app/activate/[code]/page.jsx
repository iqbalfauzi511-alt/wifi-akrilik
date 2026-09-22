import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { QrCode, Radio, AlertCircle, ArrowLeft, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getQrByCode } from '@/lib/db/queries/qr';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import ActivationForm from '@/components/customer/ActivationForm';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Aktifkan Cobascan',
  description: 'Hubungkan QR & NFC Anda dengan Google Review dan fitur bisnis lainnya.',
};

export default async function ActivateQrPage({ params }) {
  const { code } = params;
  const session = await getCurrentSession();

  // If user is not authenticated, redirect to login with return URL
  if (!session?.user) {
    redirect(`/login?next=/activate/${code}`);
  }

  const qr = await getQrByCode(code);
  const userBusinesses = session?.user?.id
    ? await getBusinessesByOwnerId(session.user.id)
    : [];

  // Check 1: QR not found
  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">QR Code Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Kode QR <span className="font-mono font-semibold">{code}</span> tidak terdaftar dalam database kami.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check 2: QR already active - Show the Barcode and business info so the user can view & download it again!
  if (qr.status === 'active') {
    return (
      <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Back Link */}
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COBASCAN SUDAH AKTIF</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
              {qr.businessName || 'Bisnis Anda'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              ⭐ Fitur Utama: <strong className="text-emerald-700 font-semibold">Google Review</strong> •{' '}
              {qr.wifiEnabled ? (
                <>Wi-Fi: <strong className="text-slate-800 font-semibold">{qr.wifiName}</strong> • </>
              ) : null}
              {qr.batchCode ? (
                <span>Paket: <strong className="font-mono text-slate-800 font-semibold">{qr.batchCode}</strong></span>
              ) : (
                <span>Satuan</span>
              )}
            </p>

            {/* Acrylic Frame QR Viewer with Download & Copy buttons */}
            <div className="flex justify-center">
              <QRCodeViewer
                code={code}
                subtitle={qr.businessName}
                size={230}
                showActions={true}
              />
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
              <a
                href={`/q/${code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button variant="primary" className="w-full shadow-md shadow-brand-600/20">
                  <span>Tes Halaman Scan / Tap NFC</span>
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </Button>
              </a>

              <Link href="/dashboard" className="w-full block">
                <Button variant="outline" className="w-full text-xs">
                  Buka Dashboard Bisnis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check 3: QR disabled
  if (qr.status === 'disabled') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">QR Dinonaktifkan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR Code ini sedang dinonaktifkan oleh administrator dan tidak dapat diaktivasi.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-2">
            <span>Kode Cobascan: <strong className="font-mono font-bold">{code}</strong></span>
          </div>

          {qr.batchCode && (
            <div className="my-2 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 leading-relaxed max-w-sm mx-auto">
              📦 Perangkat ini adalah bagian dari <strong>Paket {qr.batchCode}</strong>. Mengaktifkan kode ini akan otomatis mengaktifkan seluruh perangkat Cobascan dalam paket untuk bisnis Anda.
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Aktifkan Cobascan
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Hubungkan QR &amp; NFC Anda dengan Google Review dan fitur bisnis lainnya.
          </p>
        </div>

        {/* Activation Form with prefilled account business info */}
        <ActivationForm
          code={code}
          initialBusiness={userBusinesses[0] || null}
          businesses={userBusinesses}
          userEmail={session?.user?.email}
          batchCode={qr?.batchCode}
        />
      </div>
    </div>
  );
}
