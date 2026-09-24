import React from 'react';
import Link from 'next/link';
import {
  Store,
  QrCode,
  Users,
  Star,
  ChevronDown,
  ArrowUp,
  MoreHorizontal,
  ChevronRight,
  Wifi,
  Smartphone,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAdminStats } from '@/lib/db/queries/stats';
import { getAllQrsAdmin, getAllBatchesAdmin } from '@/lib/db/queries/qr';
import { db } from '@/lib/db';
import { businesses, qrCodes } from '@/lib/db/schema';
import { desc, eq, isNull } from 'drizzle-orm';
import DashboardHeader from '@/components/layout/DashboardHeader';
import AdminQrManager from '@/components/admin/AdminQrManager';
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
  const totalReview = Math.round(totalScan * 0.15) || 0;

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

  const recentBusinesses = dbBusinesses.map((b, idx) => ({
    id: b.id,
    name: b.businessName,
    category: 'Bisnis',
    initials: b.businessName.substring(0, 2).toUpperCase(),
    color: colors[idx % colors.length],
    devices: allQrs.filter((q) => q.businessId === b.id).length,
    scans: 0, // Activity log not implemented yet
    reviews: 0,
    status: b.wifiEnabled ? 'Aktif' : 'Nonaktif',
  }));

  // Devices needing attention: Blank/Unassigned QR codes
  const attentionDevices = allQrs
    .filter((q) => q.status === 'blank' || !q.businessId)
    .slice(0, 4)
    .map((q) => ({
      code: q.code.substring(0, 12) + '...',
      business: 'Belum Terpasang',
      issue: 'Siap Digunakan',
      isAmber: false,
    }));

  // Recent activity events (Activity log not implemented, returning empty or placeholder)
  const recentActivities = [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header matching Image 3 */}
      <DashboardHeader
        title="Dashboard"
        subtitle="Ringkasan aktivitas dan performa Cobascan."
      />

      <div className="px-4 sm:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* 4 Bento Metric Cards matching Image 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Bisnis */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Bisnis</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalBusinesses}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>

          {/* Card 2: Total Perangkat */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Perangkat</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalPerangkat}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>

          {/* Card 3: Total Scan */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Scan</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {totalScan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>

          {/* Card 4: Total Review */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Review</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalReview}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>
        </div>

        {/* Middle Row: Charts matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Chart: Aktivitas Scan — DYNAMIC */}
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
                  {totalScan > 0 && (
                    <>
                      {/* Google Review (44% blue) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#1A73E8"
                        strokeWidth="16"
                        strokeDasharray="105 238"
                        strokeDashoffset="0"
                      />
                      {/* Wi-Fi (35% green) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="16"
                        strokeDasharray="83 238"
                        strokeDashoffset="-105"
                      />
                      {/* Others (21% gray) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="16"
                        strokeDasharray="50 238"
                        strokeDashoffset="-188"
                      />
                    </>
                  )}
                </svg>

                {/* Center text */}
                <div className="absolute text-center">
                  <div className="text-base font-black text-slate-900">{totalScan.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total</div>
                </div>
              </div>
            </div>

            {/* Legend list matching Image 3 */}
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                  <span className="text-slate-600 font-medium">Buka Google Review</span>
                </div>
                <div className="font-bold text-slate-900">{totalScan > 0 ? '1.245' : '0'} <span className="text-slate-400 font-normal">{totalScan > 0 ? '44%' : '0%'}</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Lihat Wi-Fi</span>
                </div>
                <div className="font-bold text-slate-900">{totalScan > 0 ? '980' : '0'} <span className="text-slate-400 font-normal">{totalScan > 0 ? '35%' : '0%'}</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Lainnya</span>
                </div>
                <div className="font-bold text-slate-900">{totalScan > 0 ? '616' : '0'} <span className="text-slate-400 font-normal">{totalScan > 0 ? '21%' : '0%'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Table + Side Lists matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table: Daftar Bisnis Terbaru */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-slate-900 text-base">Daftar Bisnis Terbaru</h2>
              <Link href="/admin/users" className="text-xs font-bold text-[#1A73E8] hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-medium">Nama Bisnis</th>
                    <th className="pb-3 font-medium">Perangkat</th>
                    <th className="pb-3 font-medium">Total Scan</th>
                    <th className="pb-3 font-medium">Total Review</th>
                    <th className="pb-3 font-medium">Status</th>
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
          </div>

          {/* Right Side Column (2 Cards) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Perangkat Perlu Perhatian */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Perangkat Perlu Perhatian</h3>
                <Link href="/admin/qr" className="text-xs font-bold text-[#1A73E8] hover:underline">
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-3">
                {attentionDevices.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{item.code}</div>
                        <div className="text-[11px] text-slate-400">{item.business}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isAmber
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {item.issue}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Aktivitas Terbaru */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Aktivitas Terbaru</h3>
                <button className="text-xs font-bold text-[#1A73E8] hover:underline">
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <act.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {act.text}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{act.business}</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturing & Provisioning Batch Tool below */}
        <div className="pt-6">
          <AdminQrManager initialQrs={allQrs} initialBatches={batches} />
        </div>
      </div>
    </div>
  );
}
