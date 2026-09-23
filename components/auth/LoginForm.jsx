'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { devLoginAction } from '@/lib/actions/auth-actions';

export default function LoginForm({ nextUrl = '/dashboard', errorParam = '' }) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'oauth_failed'
      ? 'Gagal login dengan Google. Pastikan akun Anda sudah terdaftar.'
      : errorParam === 'unregistered_email'
      ? 'Akun dengan email ini belum terdaftar. Anda harus memiliki perangkat Cobascan terlebih dahulu.'
      : ''
  );

  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);
      setErrorMessage('');

      const supabase = createClient();
      if (!supabase) {
        setErrorMessage(
          'Konfigurasi Supabase URL/Key belum diisi di environment. Gunakan opsi login email di bawah untuk langsung menguji aplikasi!'
        );
        setIsLoadingGoogle(false);
        return;
      }

      const redirectOrigin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });

      if (error) {
        setErrorMessage(`Kendala Google OAuth: ${error.message}. Anda dapat menggunakan form email di bawah.`);
        setIsLoadingGoogle(false);
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala saat menghubungkan ke Google. Silakan gunakan form email di bawah.');
      setIsLoadingGoogle(false);
    }
  };

  const isActivationFlow = nextUrl && nextUrl.includes('/activate');
  const activationCode = isActivationFlow ? nextUrl.split('/activate/')[1]?.split('?')[0] : null;

  const [customEmail, setCustomEmail] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }
    setIsSubmittingEmail(true);
    setErrorMessage('');
    try {
      const emailTrim = customEmail.trim().toLowerCase();
      const isAdmin = emailTrim === 'admin@smartwifi.com' || emailTrim === 'distrapness@gmail.com';
      await devLoginAction({
        email: emailTrim,
        name: emailTrim.split('@')[0],
        nextUrl: nextUrl || (isAdmin ? '/admin' : '/dashboard'),
        allowSignup: isActivationFlow,
      });
    } catch (err) {
      setIsSubmittingEmail(false);
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setErrorMessage(err?.message || 'Gagal masuk dengan email');
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setCustomEmail(demoEmail);
    setIsSubmittingEmail(true);
    setErrorMessage('');
    try {
      const isAdmin = demoEmail === 'admin@smartwifi.com';
      await devLoginAction({
        email: demoEmail,
        name: isAdmin ? 'Admin' : 'Kopi Senja',
        nextUrl: isAdmin ? '/admin' : '/dashboard',
        allowSignup: true,
      });
    } catch (err) {
      setIsSubmittingEmail(false);
      if (err?.message?.includes('NEXT_REDIRECT')) return;
      setErrorMessage(err?.message || 'Gagal login demo');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="w-full max-w-[440px]">
        {/* White Card matching design mockup */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-8 sm:p-10">
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 flex items-center justify-center relative mix-blend-multiply group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-xl text-slate-900 block leading-none">cobascan</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">QR • NFC</span>
              </div>
            </Link>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Masuk ke Cobascan
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
              Kelola perangkat dan informasi bisnis Anda dengan mudah.
            </p>
          </div>

          {/* Activation Notice Banner if in activation flow */}
          {isActivationFlow && (
            <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Aktivasi Perangkat Cobascan</span>
                {activationCode && (
                  <span className="font-mono bg-blue-200/70 text-blue-900 px-1.5 py-0.5 rounded text-[11px]">
                    {activationCode}
                  </span>
                )}
              </div>
              <div>
                Masuk menggunakan email Anda untuk menghubungkan stand akrilik ini ke akun bisnis Anda.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoadingGoogle ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                atau
              </span>
            </div>
          </div>

          {/* Form Email & Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="customerEmailInput" className="block text-xs font-bold text-slate-800 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="customerEmailInput"
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="customerPasswordInput" className="block text-xs font-bold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="customerPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => alert('Fitur reset password: Silakan hubungi admin atau gunakan login langsung.')}
                  className="text-xs font-medium text-[#1A73E8] hover:underline"
                >
                  Lupa password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingEmail}
              className="w-full py-3.5 px-4 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] disabled:opacity-60 mt-2"
            >
              <span>{isSubmittingEmail ? 'Memproses...' : 'Masuk'}</span>
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6 text-xs text-slate-600">
            <span>Belum punya akun? </span>
            <Link href="/dashboard/setup" className="font-bold text-[#1A73E8] hover:underline">
              Daftar sekarang
            </Link>
          </div>

          {/* Quick Demo Access Bar for fast testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Akses Cepat Pengujian (Demo)
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('ahmad@kopisenja.com')}
                className="py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold text-center transition-colors"
              >
                ☕ Pemilik Toko
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@smartwifi.com')}
                className="py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold text-center transition-colors"
              >
                🛡️ Admin Sistem
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <p className="text-center mt-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800 underline">
            &larr; Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
