import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wifi, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getQrByCode } from '@/lib/db/queries/qr';
import ActivationForm from '@/components/customer/ActivationForm';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Aktivasi Smart Wi-Fi QR',
  description: 'Aktifkan QR Code fisik untuk bisnis Anda.',
};

export default async function ActivateQrPage({ params }) {
  const { code } = params;
  const session = await getCurrentSession();

  // If user is not authenticated, redirect to login with return URL
  if (!session?.user) {
    redirect(`/login?next=/activate/${code}`);
  }

  const qr = await getQrByCode(code);

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

  // Check 2: QR already active (Enforce ownership security - no sensitive owner data)
  if (qr.status === 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">QR sudah diaktifkan.</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            QR ini sudah terhubung dengan bisnis lain.
          </p>
          <div className="space-y-2">
            <Link href={`/q/${code}`}>
              <Button variant="primary" className="w-full">
                Lihat Halaman Scan QR Ini
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full text-xs">
                Ke Dashboard Saya
              </Button>
            </Link>
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
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 mx-auto mb-3">
            <Wifi className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-2">
            <span>Kode QR: <strong className="font-mono font-bold">{code}</strong></span>
          </div>

          {qr.batchCode && (
            <div className="my-2 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 leading-relaxed max-w-sm mx-auto">
              📦 QR ini adalah bagian dari <strong>Paket {qr.batchCode}</strong>. Mengaktifkan QR ini akan otomatis mengaktifkan seluruh QR dalam paket yang sama untuk bisnis Anda.
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Aktivasi Smart Wi-Fi
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Lengkapi data bisnis dan Wi-Fi Anda. Setelah disimpan, seluruh akrilik QR dalam paket langsung aktif seketika!
          </p>
        </div>

        {/* Activation Form */}
        <ActivationForm code={code} existingBusiness={session.business} />
      </div>
    </div>
  );
}
