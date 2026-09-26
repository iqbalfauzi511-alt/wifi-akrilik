'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { loginWithEmailPasswordAction } from '@/lib/actions/auth-actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVal || !emailVal.includes('@')) {
      setErrorMessage('Masukkan email yang valid.');
      return;
    }
    if (!passwordVal) {
      setErrorMessage('Masukkan password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const result = await loginWithEmailPasswordAction({ email: emailVal, password: passwordVal });

    if (result?.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setIsSubmitting(false);
      setErrorMessage(result?.error || 'Email atau password salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/cobascan-logo.png" alt="Cobascan" width={40} height={40} priority className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-white text-2xl tracking-tight leading-none pt-0.5">
              Cobascan Admin
            </span>
          </Link>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-black text-white tracking-tight">Panel Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Akses terbatas untuk administrator Cobascan.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  placeholder="admin@cobascan.id"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  Masuk sebagai Admin
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Kembali ke Login Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
