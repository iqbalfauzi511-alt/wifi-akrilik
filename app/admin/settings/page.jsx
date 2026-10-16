import React from 'react';
import { ShieldCheck, Database, Server, Mail } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengaturan: Cobascan Admin',
};

export default async function AdminSettingsPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();

  const adminUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'admin'))
    .catch(() => []);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          Pengaturan Platform
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Konfigurasi sistem platform Cobascan, akun Administrator, dan integrasi backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Admin Accounts Whitelist */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">Daftar Admin Cobascan</h2>
              <p className="text-xs text-slate-400 truncate">Akun dengan wewenang penuh atas platform</p>
            </div>
          </div>

          <div className="space-y-3">
            {adminUsers.map((admin) => (
              <div
                key={admin.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {admin.email?.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">{admin.email}</div>
                    <div className="text-[11px] text-slate-400 truncate">{admin.name || 'Administrator'}</div>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1A73E8] border border-blue-200">
                  Super Admin
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            💡 <strong>Keamanan:</strong> Akun Admin Cobascan ditentukan berdasarkan whitelist email terenkripsi untuk mencegah eskalasi hak akses yang tidak sah.
          </div>
        </div>

        {/* System & Database Status */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">Status Sistem</h2>
              <p className="text-xs text-slate-400 truncate">Konektivitas backend dan database</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <Database className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium text-slate-700">Database Engine</span>
              </div>
              <span className="font-bold text-slate-900 font-mono text-[11px] sm:text-xs truncate sm:text-right">
                {process.env.DATABASE_URL ? 'PostgreSQL (Supabase)' : 'PGlite (Local Engine)'}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium text-slate-700">Supabase Auth</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isSupabaseConfigured ? 'Terhubung' : 'Lokal / Standalone'}
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <Server className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium text-slate-700">Domain Publik</span>
              </div>
              <span className="font-mono text-slate-800 text-[11px] truncate sm:text-right">
                {process.env.NEXT_PUBLIC_APP_URL || 'cobascan.my.id'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
