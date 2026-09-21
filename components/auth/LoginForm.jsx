'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode } from 'lucide-react';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm({ nextUrl = '/dashboard', errorParam = '' }) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'oauth_failed' ? 'Gagal login dengan Google. Silakan coba lagi.' : ''
  );

  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);
      setErrorMessage('');

      const supabase = createClient();
      if (!supabase) {
        setErrorMessage(
          'Konfigurasi Supabase belum lengkap di .env.local. Gunakan tombol "Akses Cepat Pengujian" di bawah untuk menguji aplikasi sekarang!'
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
        setErrorMessage(error.message);
        setIsLoadingGoogle(false);
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala saat menghubungkan ke Google.');
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
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
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-60"
          >
            {/* Google SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <p className="mt-4 text-center text-[12px] text-slate-400 leading-relaxed">
            Masuk dengan akun Google Anda untuk mengaktifkan perangkat Cobascan dan mengelola ulasan Google Review serta akses Wi-Fi bisnis.
          </p>
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
