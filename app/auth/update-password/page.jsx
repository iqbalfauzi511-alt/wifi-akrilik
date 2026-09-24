'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { updatePasswordAction } from '@/lib/actions/auth-actions';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle the access_token in the URL hash (from Supabase implicit grant flow)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const supabase = createClient();
      if (supabase) {
        // Just calling getSession parses the hash and sets the session
        supabase.auth.getSession().then(({ error }) => {
          if (error) {
            setError('Tautan kedaluwarsa atau tidak valid. Silakan ulangi permintaan lupa password.');
          }
        });
      }
    } else {
      // If no hash, maybe PKCE flow used, which should already be exchanged via /auth/callback
      // Let's just verify if they have a session
      const supabase = createClient();
      if (supabase) {
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            setError('Sesi Anda tidak valid. Silakan ulangi permintaan lupa password melalui tautan di email Anda.');
          }
        });
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password minimal harus terdiri dari 6 karakter.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    const res = await updatePasswordAction(password);
    setIsSubmitting(false);
    
    if (res?.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setError(res?.error || 'Gagal mengubah password. Silakan coba lagi.');
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

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-8 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Buat Password Baru</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Silakan masukkan password baru untuk akun Anda.
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-slate-700 font-medium mb-6">
                Password Anda berhasil diperbarui! Anda akan diarahkan ke halaman login...
              </p>
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!error.includes('tidak valid')}
                className="w-full py-3 px-4 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
