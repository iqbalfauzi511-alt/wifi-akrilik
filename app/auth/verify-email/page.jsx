'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { verifyEmailAction } from '@/lib/actions/auth-actions';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const nextUrl = searchParams.get('next') || '';
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  const handleVerifyCode = async (e) => {
    e?.preventDefault();
    if (!email) return;
    if (!code || code.length < 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setIsVerifying(true);
    setError('');
    const res = await verifyEmailAction(email, code);
    setIsVerifying(false);
    if (res?.success) {
      setVerified(true);
      setMessage(res.message);
    } else {
      setError(res?.error || 'Gagal memverifikasi email.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-8 sm:p-10 text-center">
      {verified ? (
        <div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Email Terverifikasi!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Akun Anda untuk <span className="font-semibold text-slate-900">{email}</span> telah aktif dan siap digunakan.
          </p>
          <Link
            href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
            className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Verifikasi Email Anda</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Kami telah mengirimkan instruksi verifikasi ke alamat email:
            <br />
            <span className="font-bold text-slate-900 mt-1 inline-block bg-slate-100 px-3 py-1 rounded-lg">
              {email || 'email Anda'}
            </span>
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left mb-6 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">Penting:</p>
            <p>Silakan periksa kotak masuk atau folder spam email Anda. Masukkan 6-digit kode OTP di bawah ini, atau klik tautan konfirmasi jika tersedia.</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Masukkan 6 Digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all outline-none text-center text-xl font-bold tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || code.length < 6}
              className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Verifikasi Kode</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <Link
              href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all inline-block"
            >
              Kembali ke Halaman Masuk
            </Link>
          </form>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center relative">
              <Image src="/cobascan-logo.png" alt="Cobascan" width={40} height={40} priority className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight block leading-none pt-0.5">
              Cobascan
            </span>
          </Link>
        </div>

        <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>}>
          <VerifyEmailContent />
        </React.Suspense>
      </div>
    </div>
  );
}
