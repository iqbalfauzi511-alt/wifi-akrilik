'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QrCode, ShieldCheck, Store, ArrowRight, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { devLoginAction } from '@/lib/actions/auth-actions';

export default function LoginForm({ nextUrl = '/dashboard', errorParam = '' }) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
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
          'Konfigurasi Supabase URL/Key belum diisi di environment. Gunakan opsi "Akses Masuk Cepat" di bawah untuk langsung menguji aplikasi!'
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
        setErrorMessage(`Kendala Google OAuth: ${error.message}. Anda dapat menggunakan Akses Masuk Cepat di bawah.`);
        setIsLoadingGoogle(false);
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala saat menghubungkan ke Google. Silakan gunakan Akses Masuk Cepat di bawah.');
      setIsLoadingGoogle(false);
    }
  };

  const isActivationFlow = nextUrl && nextUrl.includes('/activate');
  const activationCode = isActivationFlow ? nextUrl.split('/activate/')[1]?.split('?')[0] : null;

  const [customEmail, setCustomEmail] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const handleCustomEmailLogin = async (e) => {
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
        allowSignup: isActivationFlow, // Only allow signup if they are activating a device
      });
    } catch (err) {
      setIsSubmittingEmail(false);
      // If Next.js redirect threw (normal behavior for Server Actions redirect)
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setErrorMessage(err?.message || 'Gagal masuk dengan email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform relative">
              <Image src="/logo.png" alt="Cobascan" width={200} height={200} priority className="w-full h-full object-contain drop-shadow-sm" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cobascan
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Platform QR + NFC untuk bisnis. Scan. Tap. Connect. Review.
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-lg border-slate-200/90">
          {/* Activation Notice Banner */}
          {isActivationFlow && (
            <div className="mb-5 p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-brand-800">
                <span>🔒 Aktivasi Cobascan</span>
                {activationCode && (
                  <span className="font-mono bg-brand-200/70 text-brand-900 px-1.5 py-0.5 rounded text-[11px]">
                    {activationCode}
                  </span>
                )}
              </div>
              <div>
                Silakan masuk menggunakan email Anda terlebih dahulu. Perangkat ini akan otomatis ditambahkan ke dashboard bisnis akun Anda.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Form 1: Masuk dengan Email Mandiri */}
          <form onSubmit={handleCustomEmailLogin} className="space-y-3 mb-5">
            <div>
              <label htmlFor="customerEmailInput" className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email Bisnis Anda
              </label>
              <input
                id="customerEmailInput"
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nama@gmail.com / kafe@bisnis.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Gunakan email yang sama saat membeli perangkat baru agar seluruh produk terkumpul di satu dashboard.
              </p>
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={isSubmittingEmail}
              className="w-full shadow-md shadow-brand-600/20"
            >
              <span>{isActivationFlow ? 'Masuk & Lanjutkan Aktivasi' : 'Masuk ke Dashboard'}</span>
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                ATAU DENGAN GOOGLE
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-60"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{isLoadingGoogle ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}</span>
          </button>


        </Card>

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
