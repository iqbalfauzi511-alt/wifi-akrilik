'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { requestPasswordResetAction } from '@/lib/actions/auth-actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Silakan masukkan email yang valid.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    const res = await requestPasswordResetAction(email);
    setIsSubmitting(false);
    
    if (res?.success) {
      setSuccess(true);
    } else {
      setError(res?.error || 'Gagal memproses permintaan Anda.');
    }
  };

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

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-8 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Lupa Password?</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password Anda.
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-slate-700 font-medium mb-6">
                Tautan reset password telah dikirim ke <span className="font-bold text-slate-900">{email}</span>. Silakan periksa email Anda (termasuk folder spam).
              </p>
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all inline-block"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email Terdaftar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Kirim Tautan Reset'}
              </button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="text-[#1A73E8] text-xs font-bold hover:underline inline-flex items-center gap-1"
                >
                  Batal dan kembali masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
