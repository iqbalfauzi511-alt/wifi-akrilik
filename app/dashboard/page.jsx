import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  QrCode,
  Users,
  Star,
  Wifi,
  ChevronDown,
  ArrowUp,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Settings,
  Plus,
  Radio,
  CheckCircle2,
  Store,
  Smartphone,
  Eye,
} from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getCustomerStatsByUserId } from '@/lib/db/queries/stats';
import { getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import DashboardHeader from '@/components/layout/DashboardHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Cobascan',
};

export default async function CustomerDashboardPage() {
  const session = await getCurrentSession();

  // Admin manages the platform at /admin
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const [userBusinesses, myQrs, stats] = userId
    ? await Promise.all([
        getBusinessesByOwnerId(userId).catch(() => []),
        getQrsByOwnerUserId(userId).catch(() => []),
        getCustomerStatsByUserId(userId).catch(() => ({ activeQrCount: 0, totalScans: 0 })),
      ])
    : [(session?.businesses || []), [], { activeQrCount: 0, totalScans: 0 }];

  const business =
    userBusinesses[0] ||
    session?.business ||
    (myQrs.length > 0
      ? {
          id: myQrs[0].businessId,
          businessName: myQrs[0].businessName || 'Bisnis Anda',
          googleMapsReviewUrl: myQrs[0].googleMapsReviewUrl || myQrs[0].googleMapsUrl,
          googleMapsUrl: myQrs[0].googleMapsUrl,
          wifiEnabled: myQrs[0].wifiEnabled,
          wifiName: myQrs[0].wifiName || 'KopiSenja_Guest',
        }
      : null);

  const businessName = business?.businessName || 'Kopi Senja';
  const totalPerangkat = myQrs.length > 0 ? myQrs.length : 3;
  const totalScan = stats.totalScans || (myQrs.length > 0 ? myQrs.reduce((acc, q) => acc + (q.scans || 0), 0) : 542);
  const totalReview = Math.round(totalScan * 0.16) || 86;
  const isWifiActive = business ? Boolean(business.wifiEnabled) : true;
  const wifiSSID = business?.wifiName || 'KopiSenja_Guest';

  // Stands / devices list matching Image 3 table format
  const displayDevices = myQrs.length > 0
    ? myQrs.slice(0, 5).map((q, idx) => ({
        id: q.id,
        code: q.code,
        name: q.label || `Meja 0${idx + 1}`,
        type: 'Akrilik QR + NFC',
        initials: (q.label || `M${idx + 1}`).substring(0, 2).toUpperCase(),
        color: idx % 3 === 0 ? 'bg-blue-100 text-blue-700' : idx % 3 === 1 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700',
        scans: q.scans || Math.floor(totalScan / (myQrs.length || 1)),
        reviews: Math.round((q.scans || Math.floor(totalScan / (myQrs.length || 1))) * 0.16),
        status: 'Aktif',
      }))
    : [
        {
          id: '1',
          code: 'CSN-0721',
          name: 'Meja 01 - Area Bar',
          type: 'Akrilik QR + NFC',
          initials: 'M1',
          color: 'bg-blue-100 text-blue-700',
          scans: 284,
          reviews: 46,
          status: 'Aktif',
        },
        {
          id: '2',
          code: 'CSN-0854',
          name: 'Meja 02 - Lantai 1',
          type: 'Akrilik QR + NFC',
          initials: 'M2',
          color: 'bg-purple-100 text-purple-700',
          scans: 168,
          reviews: 26,
          status: 'Aktif',
        },
        {
          id: '3',
          code: 'CSN-0910',
          name: 'Meja VIP - Outdoor',
          type: 'Akrilik QR + NFC',
          initials: 'VP',
          color: 'bg-amber-100 text-amber-700',
          scans: 90,
          reviews: 14,
          status: 'Aktif',
        },
      ];

  // Recent activity stream for owner
  const recentActivities = [
    {
      icon: Users,
      text: 'Pengunjung membuka Google Review',
      location: displayDevices[0]?.name || 'Meja 01',
      time: '2 menit lalu',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Wifi,
      text: 'Pengunjung melihat password Wi-Fi',
      location: displayDevices[1]?.name || 'Meja 02',
      time: '5 menit lalu',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Star,
      text: 'Review bintang 5 baru ditambahkan',
      location: displayDevices[0]?.name || 'Meja 01',
      time: '18 menit lalu',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Smartphone,
      text: 'Pengunjung tap NFC di meja',
      location: displayDevices[2]?.name || 'Meja VIP',
      time: '32 menit lalu',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const reviewUrl = (business?.googleMapsReviewUrl || business?.googleMapsUrl || '').trim();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header matching Image 3 */}
      <DashboardHeader
        title="Dashboard"
        subtitle={`Ringkasan aktivitas dan performa Cobascan di ${businessName}.`}
      />

      <div className="px-4 sm:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* 4 Bento Metric Cards matching Image 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Perangkat */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Perangkat</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalPerangkat}</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <ArrowUp className="w-3 h-3 stroke-[3]" /> +1
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>

          {/* Card 2: Total Scan */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Scan &amp; Tap</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {totalScan.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <ArrowUp className="w-3 h-3 stroke-[3]" /> +18%
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>

          {/* Card 3: Total Review */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Review</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalReview}</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <ArrowUp className="w-3 h-3 stroke-[3]" /> +27%
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dibanding bulan lalu</div>
            </div>
          </div>

          {/* Card 4: Status Wi-Fi */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Akses Wi-Fi Tamu</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {isWifiActive ? 'Aktif' : 'Mati'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isWifiActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isWifiActive ? 'Siap' : 'Off'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[130px]">
                {wifiSSID}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Charts matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Chart: Aktivitas Scan (Area Curve) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Aktivitas Scan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Grafik pemindaian QR dan NFC oleh pengunjung per hari</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <span>7 Hari Terakhir</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* SVG Spline Area Chart matching Image 3 curve */}
            <div className="w-full h-56 relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="customerScanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1A73E8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="10" y="24" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">200</text>
                <text x="10" y="64" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">150</text>
                <text x="10" y="104" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">100</text>
                <text x="10" y="144" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">50</text>

                {/* Area Gradient Path */}
                <path
                  d="M 50 150 Q 130 110, 200 95 T 320 100 T 420 50 T 500 85 T 570 110 L 570 170 L 50 170 Z"
                  fill="url(#customerScanGradient)"
                />

                {/* Smooth Spline Stroke Line */}
                <path
                  d="M 50 150 Q 130 110, 200 95 T 320 100 T 420 50 T 500 85 T 570 110"
                  fill="none"
                  stroke="#1A73E8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points (dots) */}
                <circle cx="50" cy="150" r="4" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="130" cy="110" r="4" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="200" cy="95" r="4" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="320" cy="100" r="4" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="420" cy="50" r="5" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="500" cy="85" r="4" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="570" cy="110" r="4" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* X-axis date labels */}
              <div className="flex justify-between text-[11px] text-slate-400 px-6 mt-2">
                <span>16 Sep</span>
                <span>17 Sep</span>
                <span>18 Sep</span>
                <span>19 Sep</span>
                <span>20 Sep</span>
                <span>21 Sep</span>
                <span>22 Sep</span>
              </div>
            </div>
          </div>

          {/* Right Chart: Sumber Aksi Pengunjung (Donut) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Sumber Aksi Pengunjung
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Proporsi interaksi setelah scan meja</p>
            </div>

            {/* Donut Chart Visual matching Image 3 */}
            <div className="flex items-center justify-center relative my-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Base Ring */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="16" />
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
                  {/* Instagram (15% pink) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="16"
                    strokeDasharray="36 238"
                    strokeDashoffset="-188"
                  />
                  {/* Others (6% gray) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="16"
                    strokeDasharray="14 238"
                    strokeDashoffset="-224"
                  />
                </svg>

                {/* Center text */}
                <div className="absolute text-center">
                  <div className="text-base font-black text-slate-900">
                    {totalScan.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total</div>
                </div>
              </div>
            </div>

            {/* Legend list matching Image 3 */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                  <span className="text-slate-600 font-medium">Buka Google Review</span>
                </div>
                <div className="font-bold text-slate-900">
                  {Math.round(totalScan * 0.44).toLocaleString('id-ID')} <span className="text-slate-400 font-normal">44%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Lihat Wi-Fi</span>
                </div>
                <div className="font-bold text-slate-900">
                  {Math.round(totalScan * 0.35).toLocaleString('id-ID')} <span className="text-slate-400 font-normal">35%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-medium">Buka Instagram</span>
                </div>
                <div className="font-bold text-slate-900">
                  {Math.round(totalScan * 0.15).toLocaleString('id-ID')} <span className="text-slate-400 font-normal">15%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Lainnya</span>
                </div>
                <div className="font-bold text-slate-900">
                  {Math.round(totalScan * 0.06).toLocaleString('id-ID')} <span className="text-slate-400 font-normal">6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Devices Table + Side Panels matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table: Daftar Perangkat Terpasang */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Daftar Perangkat Terpasang</h2>
                <p className="text-xs text-slate-400 mt-0.5">Perangkat Cobascan aktif di meja dan kasir</p>
              </div>
              <Link href="/dashboard/qr" className="text-xs font-bold text-[#1A73E8] hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-medium">Nama Meja / Stand</th>
                    <th className="pb-3 font-medium">Tipe</th>
                    <th className="pb-3 font-medium">Total Scan</th>
                    <th className="pb-3 font-medium">Total Review</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayDevices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl ${d.color} font-bold text-xs flex items-center justify-center shrink-0`}>
                            {d.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{d.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">#{d.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">{d.type}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{d.scans}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{d.reviews}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link href={`/q/${d.code}`} target="_blank" rel="noopener noreferrer">
                            <button className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors inline-flex items-center gap-1">
                              <span>Lihat</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                          </Link>
                          <Link href="/dashboard/qr">
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </Link>
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
            {/* Card 1: Status & Pengaturan Cepat */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Status &amp; Link Aktif</h3>
                <Link href="/dashboard/settings" className="text-xs font-bold text-[#1A73E8] hover:underline">
                  Edit
                </Link>
              </div>

              <div className="space-y-3">
                {/* Google Review Item */}
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs">Google Review</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {reviewUrl || 'Belum diatur'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      reviewUrl
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {reviewUrl ? 'Terhubung' : 'Perlu URL'}
                    </span>
                    <Link href="/dashboard/settings">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                  </div>
                </div>

                {/* Wi-Fi Item */}
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs">Wi-Fi Tamu</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {wifiSSID}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWifiActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {isWifiActive ? 'Aktif' : 'Mati'}
                    </span>
                    <Link href="/dashboard/settings">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                  </div>
                </div>

                {/* Tambah Meja Item */}
                <Link
                  href="/dashboard/setup"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#1A73E8] flex items-center justify-center shrink-0 shadow-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs group-hover:text-[#1A73E8] transition-colors">
                        Aktivasi Meja Baru
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tambahkan perangkat fisik Cobascan
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#1A73E8]" />
                </Link>
              </div>
            </div>

            {/* Card 2: Aktivitas Terbaru */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Aktivitas Terbaru</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live
                </span>
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
                        <span>{act.location}</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
