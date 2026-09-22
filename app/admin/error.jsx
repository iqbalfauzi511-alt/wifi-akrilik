'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Database, Home, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('Admin Server Component Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-200/80 shadow-xl p-6 sm:p-8 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            Admin Console Exception
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Gagal Memuat Admin Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Terjadi kendala saat menghubungkan atau merender komponen server admin. Silakan coba muat ulang atau periksa variabel koneksi database.
          </p>
        </div>

        {error?.digest && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-[11px] text-slate-600 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[9px]">Error Digest ID</div>
            <div className="select-all text-slate-800 break-all">{error.digest}</div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-left text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-950">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Pemeriksaan Konfigurasi:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
            <li>Pastikan variabel <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-800">DATABASE_URL</code> sudah terisi di <strong>Vercel Settings &gt; Environment Variables</strong>.</li>
            <li>Pastikan database PostgreSQL Supabase dalam status <strong>Active</strong>.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Ke Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
