'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Eye, EyeOff, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { ownerLoginAction } from '@/lib/actions/owner-auth-actions';

const ADMIN_WA = process.env.NEXT_PUBLIC_ADMIN_WA || '6285888159265';

export default function LoginForm({ nextUrl = '/dashboard', errorParam = '' }) {
  const router = useRouter();
  const [waVal, setWaVal] = useState('');
  const [pinVal, setPinVal] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'unauthorized' ? 'Silakan masuk untuk melanjutkan.' : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!waVal.trim()) {
      setErrorMessage('Masukkan nomor WhatsApp Anda.');
      return;
    }
    if (!pinVal || pinVal.length !== 6) {
      setErrorMessage('PIN harus 6 angka.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const result = await ownerLoginAction({ whatsapp: waVal.trim(), pin: pinVal });

    if (result?.success) {
      router.push(nextUrl || '/dashboard');
      router.refresh();
    } else {
      setIsSubmitting(false);
      setErrorMessage(result?.error || 'Gagal masuk. Coba lagi.');
    }
  };

  const forgotPinUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(
    `Halo Admin Cobascan, saya lupa PIN untuk nomor WA ${waVal || '[nomor WA Anda]'}. Mohon bantu reset. Terima kasih.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/cobascan-logo.png" alt="Cobascan" width={40} height={40} priority className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight leading-none pt-0.5">
              Cobascan
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Masuk Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola perangkat dan Wi-Fi bisnis Anda.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* WA Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="whatsapp-input"
                  type="tel"
                  value={waVal}
                  onChange={(e) => setWaVal(e.target.value)}
                  placeholder="08123456789"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                PIN (6 Angka)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="pin-input"
                  type={showPin ? 'text' : 'password'}
                  value={pinVal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPinVal(val);
                  }}
                  placeholder="••••••"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((s) => !s)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-slate-900/20 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Lupa PIN */}
          <div className="mt-5 text-center">
            <a
              href={forgotPinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-[#1A73E8] transition-colors"
            >
              Lupa PIN? Hubungi Admin via WhatsApp →
            </a>
          </div>

          {/* Belum punya akun */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Belum punya akun?{' '}
              <Link href="/activate" className="text-[#1A73E8] font-semibold hover:underline">
                Aktivasi perangkat Cobascan
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

