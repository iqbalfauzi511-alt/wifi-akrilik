import React from 'react';
import Link from 'next/link';
import {
  Store,
  QrCode,
  Users,
  Star,
  MoreHorizontal,
  ChevronRight,
  Wifi,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { getAdminStats } from '@/lib/db/queries/stats';
import { getAllQrsAdmin, getAllBatchesAdmin } from '@/lib/db/queries/qr';
import { db } from '@/lib/db';
import { businesses, qrCodes, scanLogs } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ScanActivityChart from '@/components/charts/ScanActivityChart';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Cobascan Admin',
};

export default async function AdminDashboardPage() {
  const [stats, allQrs, batches] = await Promise.all([
    getAdminStats().catch(() => ({})),
    getAllQrsAdmin().catch(() => []),
    getAllBatchesAdmin().catch(() => []),
  ]);

  const totalBusinesses = stats.totalBusinesses || 0;
  const totalPerangkat = stats.totalQr || 0;
  const totalScan = stats.totalScans || 0;
  const totalReview = stats.actionReview || 0;
  
  const totalActionScans = (stats.actionReview || 0) + (stats.actionWifi || 0) + (stats.actionOther || 0);

  // Fetch actual recent businesses
  const dbBusinesses = await db
    .select()
    .from(businesses)
    .orderBy(desc(businesses.createdAt))
    .limit(5)
    .catch(() => []);

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
  ];

  const recentBusinesses = dbBusinesses.map((b, idx) => {
    const bizQrs = allQrs.filter((q) => q.businessId === b.id);
    const bizScans = bizQrs.reduce((acc, q) => acc + (q.scanCount || 0), 0);
    return {
      id: b.id,
      name: b.businessName,
      category: 'Bisnis',
      initials: b.businessName.substring(0, 2).toUpperCase(),
      color: colors[idx % colors.length],
      devices: bizQrs.length,
      scans: bizScans,
      reviews: b.googleMapsReviewUrl ? 'Tersedia' : 'Belum diatur',
      status: (b.wifiEnabled || bizQrs.some(q => q.wifiEnabled)) ? 'Aktif' : 'Nonaktif',
    };
  });
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header matching Image 3 */}
      <DashboardHeader
        title="Dashboard"
        subtitle="Ringkasan aktivitas dan performa Cobascan."
      />

      <div className="px-4 sm:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* 4 Bento Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Bisnis */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Bisnis</div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{totalBusinesses}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Sistem terdaftar</div>
          </div>

          {/* Card 2: Total Perangkat */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Perangkat</div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{totalPerangkat}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Perangkat fisik</div>
          </div>

          {/* Card 3: Total Scan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Scan</div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{totalScan.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Pengunjung Riil</div>
          </div>

          {/* Card 4: Klik Halaman Review */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Klik Halaman Review</div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{totalReview.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Klik Terkonversi</div>
          </div>
        </div>

        {/* Middle Row: Charts matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Chart: Aktivitas Scan: DYNAMIC */}
          <div className="lg:col-span-8">
            <ScanActivityChart initialPeriod="7d" />
          </div>

          {/* Right Chart: Sumber Aksi Pengunjung (Donut) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <h2 className="font-extrabold text-slate-900 text-base mb-4">
              Sumber Aksi Pengunjung
            </h2>

            {/* Donut Chart Visual */}
            <div className="flex items-center justify-center relative my-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Base Ring */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="16" />
                  {totalActionScans > 0 && (
                    <>
                      {/* Google Review (blue) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#1A73E8"
                        strokeWidth="16"
                        strokeDasharray={`${(stats.actionReview / totalActionScans) * 238} 238`}
                        strokeDashoffset="0"
                      />
                      {/* Wi-Fi (green) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="16"
                        strokeDasharray={`${(stats.actionWifi / totalActionScans) * 238} 238`}
                        strokeDashoffset={`-${(stats.actionReview / totalActionScans) * 238}`}
                      />
                      {/* Others (gray) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="16"
                        strokeDasharray={`${(stats.actionOther / totalActionScans) * 238} 238`}
                        strokeDashoffset={`-${((stats.actionReview + stats.actionWifi) / totalActionScans) * 238}`}
                      />
                    </>
                  )}
                </svg>

                {/* Center text */}
                <div className="absolute text-center">
                  <div className="text-base font-black text-slate-900">{totalActionScans.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Aksi</div>
                </div>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                  <span className="text-slate-600 font-medium">Klik Halaman Review</span>
                </div>
                <div className="font-bold text-slate-900">{stats.actionReview.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">{totalActionScans > 0 ? Math.round((stats.actionReview / totalActionScans) * 100) : 0}%</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Akses Wi-Fi</span>
                </div>
                <div className="font-bold text-slate-900">{stats.actionWifi.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">{totalActionScans > 0 ? Math.round((stats.actionWifi / totalActionScans) * 100) : 0}%</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Lainnya</span>
                </div>
                <div className="font-bold text-slate-900">{stats.actionOther.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">{totalActionScans > 0 ? Math.round((stats.actionOther / totalActionScans) * 100) : 0}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Table + Side Lists matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table: Daftar Bisnis Terbaru */}
          <div className="lg:col-span-12 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-slate-900 text-base">Daftar Bisnis Terbaru</h2>
              <Link href="/admin/users" className="text-xs font-bold text-[#1A73E8] hover:underline">
                Lihat Semua
              </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-medium">Nama Bisnis</th>
                    <th className="pb-3 font-medium">Perangkat</th>
                    <th className="pb-3 font-medium">Total Scan</th>
                    <th className="pb-3 font-medium">Status Maps</th>
                    <th className="pb-3 font-medium">Status Wi-Fi</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl ${b.color} font-bold text-xs flex items-center justify-center shrink-0`}>
                            {b.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{b.name}</div>
                            <div className="text-[11px] text-slate-400">{b.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-700 font-semibold">{b.devices}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{b.scans}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{b.reviews}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          b.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            b.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`} />
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link href={`/admin/users`}>
                            <button className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors">
                              Lihat
                            </button>
                          </Link>
                          <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {recentBusinesses.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${b.color} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {b.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{b.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{b.category}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      b.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium mb-0.5">Perangkat</div>
                      <div className="font-bold text-slate-700 text-xs">{b.devices}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium mb-0.5">Total Scan</div>
                      <div className="font-bold text-slate-700 text-xs">{b.scans}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium mb-0.5">Status Maps</div>
                      <div className="font-bold text-slate-700 text-xs truncate max-w-[80px]" title={b.reviews}>{b.reviews}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Link href={`/admin/users`} className="block w-full">
                      <button className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-colors">
                        Lihat Detail Bisnis
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
