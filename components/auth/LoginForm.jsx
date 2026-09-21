'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, ShieldCheck, Store, ArrowRight, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { devLoginAction } from '@/lib/actions/auth-actions';

export default function LoginForm({ nextUrl = '/dashboard', errorParam = '' }) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'oauth_failed'
      ? 'Gagal login dengan Google. Pastikan Google OAuth telah diaktifkan di Supabase Dashboard, atau gunakan Akses Masuk Cepat di bawah.'
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
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">
              ⚠️ {errorMessage}
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

          {/* Quick Dev Switcher for instant testing */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                ATAU MASUK CEPAT (MODE PENGUJIAN)
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-500 text-center mb-2">
              Pilih akun untuk langsung masuk tanpa perlu OAuth Google:
            </p>

            {/* Login as Business Owner / Customer */}
            <form
              action={async () => {
                await devLoginAction({
                  email: 'owner@cobascan.com',
                  name: 'Pemilik Bisnis (Demo)',
                  role: 'customer',
                  nextUrl,
                });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left text-xs bg-slate-50/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Masuk sebagai Pemilik Bisnis (Customer)</div>
                    <div className="text-[10px] text-slate-500">owner@cobascan.com &bull; Akses Dashboard &amp; Aktivasi</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </form>

            {/* Login as Admin */}
            <form
              action={async () => {
                await devLoginAction({
                  email: 'admin@smartwifi.com',
                  name: 'Administrator Cobascan',
                  role: 'admin',
                  nextUrl: nextUrl.startsWith('/admin') ? nextUrl : '/admin',
                });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left text-xs bg-slate-50/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Masuk sebagai Administrator</div>
                    <div className="text-[10px] text-slate-500">admin@smartwifi.com &bull; Akses Admin Portal</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </form>
          </div>
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
