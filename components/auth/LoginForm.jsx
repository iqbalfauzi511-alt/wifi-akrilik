'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  loginWithEmailPasswordAction,
  registerWithEmailPasswordAction,
  devLoginAction,
} from '@/lib/actions/auth-actions';

export default function LoginForm({ nextUrl = '/dashboard', errorParam = '' }) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [nameVal, setNameVal] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');

  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'oauth_failed'
      ? 'Gagal login dengan Google. Pastikan akun Anda sudah terdaftar.'
      : errorParam === 'unregistered_email'
      ? 'Akun dengan email ini belum terdaftar. Silakan daftar akun Pemilik Bisnis terlebih dahulu.'
      : ''
  );
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);
      setErrorMessage('');

      const supabase = createClient();
      if (!supabase) {
        setErrorMessage(
          'Konfigurasi Supabase URL/Key belum diisi di environment. Gunakan opsi login email di bawah untuk langsung menguji aplikasi.'
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
    } catch {
      setErrorMessage('Terjadi kendala saat menghubungkan ke Google. Silakan gunakan form email di bawah.');
      setIsLoadingGoogle(false);
    }
  };

  // Handle Email + Password Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailVal || !emailVal.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!passwordVal) {
      setErrorMessage('Silakan masukkan password Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await loginWithEmailPasswordAction({
        email: emailVal,
        password: passwordVal,
        nextUrl,
      });

      if (res?.success) {
        router.push(res.redirectUrl || '/dashboard');
      } else {
        setIsSubmitting(false);
        if (res?.requireVerification) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(emailVal)}&next=${encodeURIComponent(nextUrl)}`);
        } else {
          setErrorMessage(res?.error || 'Gagal masuk. Periksa kembali email dan password Anda.');
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat mencoba masuk.');
    }
  };

  // Handle Email + Password Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!nameVal.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!emailVal || !emailVal.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!passwordVal || passwordVal.length < 6) {
      setErrorMessage('Password minimal terdiri dari 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await registerWithEmailPasswordAction({
        name: nameVal,
        email: emailVal,
        password: passwordVal,
      });

      if (res?.success) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(emailVal)}&next=${encodeURIComponent(nextUrl)}`);
      } else {
        setIsSubmitting(false);
        setErrorMessage(res?.error || 'Gagal mendaftar akun.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat mendaftar.');
    }
  };

  // Quick Demo Shortcut for Evaluator
  const handleQuickDemo = async (demoEmail) => {
    setEmailVal(demoEmail);
    setPasswordVal('cobascan2026');
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const isAdmin = demoEmail === 'admin@smartwifi.com';
      await devLoginAction({
        email: demoEmail,
        name: isAdmin ? 'Admin Cobascan' : 'Kopi Senja',
        nextUrl: isAdmin ? '/admin' : '/dashboard',
        allowSignup: true,
      });
    } catch (err) {
      setIsSubmitting(false);
      if (err?.message?.includes('NEXT_REDIRECT')) return;
      setErrorMessage(err?.message || 'Gagal masuk ke mode demo');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 max-w-md w-full mx-auto">
      {/* Brand Header matching Image 2 */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 flex items-center justify-center relative mix-blend-multiply group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight leading-none mt-1">
            cobascan
          </span>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            QR • NFC
          </span>
        </Link>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-5">
          {authMode === 'login' ? 'Masuk ke Cobascan' : 'Daftar Akun Baru'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          {authMode === 'login'
            ? 'Kelola perangkat dan informasi bisnis Anda dengan mudah.'
            : 'Daftarkan bisnis Anda untuk mengaktifkan stand Cobascan.'}
        </p>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoadingGoogle || isSubmitting}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all shadow-xs disabled:opacity-60"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{isLoadingGoogle ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400 font-medium">atau</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* Form: Login or Register */}
      <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
        {authMode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                placeholder="Nama Anda"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              placeholder="Masukkan email Anda"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              placeholder="Masukkan password"
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {authMode === 'login' && (
            <div className="flex justify-end mt-1.5">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[#1A73E8] hover:underline"
              >
                Lupa password?
              </Link>
            </div>
          )}
        </div>

        {authMode === 'register' && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            💡 <strong>Wajib Verifikasi:</strong> Setelah mendaftar, link konfirmasi akan dikirim ke email Anda untuk mengaktifkan akun.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting
            ? 'Memproses...'
            : authMode === 'login'
            ? 'Masuk'
            : 'Daftar Akun'}
        </button>
      </form>

      {/* Switch between Login and Register */}
      <div className="text-center mt-6 text-xs text-slate-500">
        {authMode === 'login' ? (
          <p>
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => {
                if (nextUrl?.includes('/activate')) {
                  setAuthMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                } else {
                  setErrorMessage('Pendaftaran akun baru hanya dapat dilakukan dengan memindai (scan) fisik QR Code perangkat Cobascan Anda yang belum aktif.');
                }
              }}
              className="text-[#1A73E8] font-bold hover:underline"
            >
              Daftar sekarang
            </button>
          </p>
        ) : (
          <p>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-[#1A73E8] font-bold hover:underline"
            >
              Masuk sekarang
            </button>
          </p>
        )}
      </div>

      {/* Developer Demo Account Shortcuts */}
      <div className="mt-8 pt-5 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
          Akun Demo Langsung
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('ahmad@kopisenja.com')}
            className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 text-center transition-colors"
          >
            Pemilik Bisnis
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@smartwifi.com')}
            className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 text-center transition-colors"
          >
            Admin Cobascan
          </button>
        </div>
      </div>
    </div>
  );
}
