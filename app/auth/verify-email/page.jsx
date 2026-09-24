'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { verifyEmailAction } from '@/lib/actions/auth-actions';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSimulateVerify = async () => {
    if (!email) return;
    setIsVerifying(true);
    setError('');
    const res = await verifyEmailAction(email);
    setIsVerifying(false);
    if (res?.success) {
      setVerified(true);
      setMessage(res.message);
    } else {
      setError(res?.error || 'Gagal memverifikasi email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 flex items-center justify-center relative mix-blend-multiply">
              <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xl tracking-tight block leading-none">
                cobascan
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                QR • NFC
              </span>
            </div>
          </Link>
        </div>

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
                href="/login"
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
                <p>Silakan buka kotak masuk atau folder spam email Anda, lalu klik tautan konfirmasi untuk mengaktifkan akun Pemilik Bisnis Anda.</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSimulateVerify}
                  disabled={isVerifying}
                  className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi Verifikasi Email</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all inline-block"
                >
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
