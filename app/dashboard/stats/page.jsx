import React from 'react';
import { redirect } from 'next/navigation';
import { Store, QrCode, Users, Star, MessageSquare, Wifi } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import { getCustomerStatsByUserId } from '@/lib/db/queries/stats';
import { ensureDatabaseInitialized } from '@/lib/db';
import ScanActivityChart from '@/components/charts/ScanActivityChart';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Statistik: Cobascan Pemilik Bisnis',
};

export default async function CustomerStatsPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const userBusinesses = userId
    ? await getBusinessesByOwnerId(userId).catch(() => [])
    : [];

  const business = userBusinesses[0] || session?.business;
  const myQrs = userId
    ? await getQrsByOwnerUserId(userId).catch(() => [])
    : [];

  const stats = userId 
    ? await getCustomerStatsByUserId(userId).catch(() => ({}))
    : {};

  const totalScans = stats.totalScans || 0;
  const totalReview = stats.actionReview || 0;
  
  const totalActionScans = (stats.actionReview || 0) + (stats.actionWifi || 0) + (stats.actionOther || 0);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          Statistik Pengunjung
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Analisis mendalam interaksi pelanggan melalui scan QR dan tap NFC di {business?.businessName || 'bisnis Anda'}.
        </p>
      </div>

      {/* 4 Bento Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Cabang Bisnis</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{userBusinesses.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Lokasi terdaftar</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Perangkat</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalQrCount || 0}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{stats.activeQrCount || 0} Aktif Digunakan</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Scan</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalScans.toLocaleString('id-ID')}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Pengunjung Riil</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Klik Google Review</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalReview}</div>
            <div className="text-[11px] text-amber-500 font-bold mt-0.5">Terkonversi</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Scan Chart */}
        <div className="lg:col-span-2">
          <ScanActivityChart />
        </div>

        {/* Aggregated Action Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base mb-6">
              Distribusi Aksi Pengunjung
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div>
                  <div className="text-xs font-bold text-[#1A73E8] mb-1">Membuka Google Review</div>
                  <div className="text-xs text-slate-500">Redirect ke profil maps</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.actionReview || 0}</div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div>
                  <div className="text-xs font-bold text-emerald-600 mb-1">Akses Wi-Fi Tamu</div>
                  <div className="text-xs text-slate-500">Melihat atau menyalin sandi</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.actionWifi || 0}</div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div>
                  <div className="text-xs font-bold text-purple-600 mb-1">Aksi Lainnya</div>
                  <div className="text-xs text-slate-500">Membaca panduan, dsb</div>
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.actionOther || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500 text-center">
              Total Interaksi Tombol: <span className="font-bold text-slate-700">{totalActionScans} kali</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown per Table / Stand */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs mt-6">
        <h2 className="font-extrabold text-slate-900 text-base mb-4">
          Performa Interaksi per Perangkat
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-3 font-medium">Perangkat / Meja</th>
                <th className="pb-3 font-medium">Kode</th>
                <th className="pb-3 font-medium">Total Scan (View)</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myQrs.length > 0 ? (
                myQrs.map((q, idx) => {
                  const qScans = q.scanCount || 0;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">{q.deviceName || `Meja 0${idx + 1}`}</td>
                      <td className="py-3.5 font-mono text-slate-400">#{q.code}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{qScans}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${q.status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${q.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {q.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Belum ada data perangkat aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
