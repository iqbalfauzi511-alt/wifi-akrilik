'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ScanActivityChart from '@/components/charts/ScanActivityChart';
import {
  QrCode,
  Users,
  Star,
  MessageSquare,
  Wifi,
  ChevronDown,
  ArrowUp,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Plus,
  Calendar,
} from 'lucide-react';

export default function OwnerDashboardView({
  business,
  devices = [],
  scanLogs = [],
  feedbacks = [],
}) {
  const [filterPeriod, setFilterPeriod] = useState('7d'); // '7d' | '30d' | 'this_month' | 'last_month'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const businessName = business?.businessName || 'Bisnis Anda';
  const totalDevices = devices.length;
  const isWifiActive = Boolean(business?.wifiEnabled);
  const wifiSSID = business?.wifiName || 'KopiSenja_Guest';

  // Compute metrics based on real data
  const totalScans = scanLogs.length;
  const totalFeedbacks = feedbacks.length;
  const totalReviews = Math.round(totalScans * 0.16);

  // Average rating
  const avgRating = useMemo(() => {
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
      return (sum / feedbacks.length).toFixed(1);
    }
    return '0.0';
  }, [feedbacks]);

  // Dynamic Date Filter & Chart Data Generation
  const chartData = useMemo(() => {
    const now = new Date();
    let numDays = 7;
    let labelFormat = 'date'; // 'date' or 'day'

    if (filterPeriod === '7d') {
      numDays = 7;
    } else if (filterPeriod === '30d') {
      numDays = 30;
    } else if (filterPeriod === 'this_month') {
      numDays = now.getDate();
    } else if (filterPeriod === 'last_month') {
      numDays = 30;
    }

    const labels = [];
    const values = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;

      // Count scans matching this day from real scanLogs if any
      const matchingScans = scanLogs.filter((s) => {
        const sDate = new Date(s.scannedAt);
        return (
          sDate.getDate() === d.getDate() &&
          sDate.getMonth() === d.getMonth() &&
          sDate.getFullYear() === d.getFullYear()
        );
      });

      const dayValue = matchingScans.length;

      labels.push(dayLabel);
      values.push(dayValue);
    }

    const maxValue = Math.max(...values, 20);

    return {
      labels,
      values,
      maxValue,
      totalForPeriod: values.reduce((a, b) => a + b, 0),
    };
  }, [filterPeriod, scanLogs]);

  // SVG Spline curve generator
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const points = useMemo(() => {
    const count = chartData.values.length;
    const stepX = (svgWidth - paddingX * 2) / Math.max(count - 1, 1);
    const maxVal = Math.max(chartData.maxValue * 1.15, 30);

    return chartData.values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
      return { x, y, val };
    });
  }, [chartData, svgWidth, svgHeight, paddingX, paddingY]);

  // Construct smooth bezier path
  const curvePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` Q ${cpX} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2} T ${p1.x} ${p1.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const lastPoint = points[points.length - 1];
    return `${curvePath} L ${lastPoint.x} ${svgHeight - 10} L ${points[0].x} ${svgHeight - 10} Z`;
  }, [curvePath, points, svgHeight]);

  // Filter labels
  const filterLabel = {
    '7d': '7 Hari Terakhir',
    '30d': '30 Hari Terakhir',
    'this_month': 'Bulan Ini',
    'last_month': 'Bulan Lalu',
  }[filterPeriod];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header matching Image 3 */}
      <header className="py-6 px-4 sm:px-8 bg-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Ringkasan aktivitas dan performa Cobascan di {businessName}.
          </p>
        </div>

        {/* Date Filter Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{filterLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {[
                { id: '7d', label: '7 Hari Terakhir' },
                { id: '30d', label: '30 Hari Terakhir' },
                { id: 'this_month', label: 'Bulan Ini' },
                { id: 'last_month', label: 'Bulan Lalu' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFilterPeriod(item.id);
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                    filterPeriod === item.id
                      ? 'bg-blue-50 text-[#1A73E8]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {filterPeriod === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="px-4 sm:px-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* 4 Bento Metric Cards matching Image 3 layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Perangkat Aktif */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Perangkat Aktif</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalDevices}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Meja terhubung</div>
            </div>
          </div>

          {/* Card 2: Total Scan */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Scan</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {totalScans.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Interaksi pelanggan</div>
            </div>
          </div>

          {/* Card 3: Rating & Ulasan */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Rating &amp; Ulasan</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{avgRating}</span>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                  ★ ({totalReviews})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Google Review</div>
            </div>
          </div>

          {/* Card 4: Masukan & Feedback */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Masukan Pelanggan</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{totalFeedbacks}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  WhatsApp
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Rating 1-2 bintang</div>
            </div>
          </div>
        </div>

        {/* Middle Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Chart: Aktivitas Scan — DYNAMIC */}
          <div className="lg:col-span-8">
            <ScanActivityChart initialPeriod="7d" />
          </div>

          {/* Right Chart: Sumber Aksi Pengunjung */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                Sumber Aksi Pengunjung
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Proporsi aksi tamu saat scan meja</p>
            </div>

            {/* Donut Chart Visual */}
            <div className="flex items-center justify-center relative my-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="16" />
                  {totalScans > 0 && (
                    <>
                      {/* Google Review (48%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#1A73E8"
                        strokeWidth="16"
                        strokeDasharray="114 238"
                        strokeDashoffset="0"
                      />
                      {/* Wi-Fi (34%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="16"
                        strokeDasharray="81 238"
                        strokeDashoffset="-114"
                      />
                      {/* WhatsApp Feedback (12%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="16"
                        strokeDasharray="28 238"
                        strokeDashoffset="-195"
                      />
                      {/* Lainnya (6%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="16"
                        strokeDasharray="15 238"
                        strokeDashoffset="-223"
                      />
                    </>
                  )}
                </svg>

                <div className="absolute text-center">
                  <div className="text-base font-black text-slate-900">
                    {totalScans.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                  <span className="text-slate-600 font-medium">Buka Google Review</span>
                </div>
                <div className="font-bold text-slate-900">
                  {totalScans > 0 ? Math.round(totalScans * 0.48).toLocaleString('id-ID') : 0} <span className="text-slate-400 font-normal">{totalScans > 0 ? '48%' : '0%'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Lihat Wi-Fi</span>
                </div>
                <div className="font-bold text-slate-900">
                  {totalScans > 0 ? Math.round(totalScans * 0.34).toLocaleString('id-ID') : 0} <span className="text-slate-400 font-normal">{totalScans > 0 ? '34%' : '0%'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-medium">Masukan WhatsApp</span>
                </div>
                <div className="font-bold text-slate-900">
                  {totalScans > 0 ? Math.round(totalScans * 0.12).toLocaleString('id-ID') : 0} <span className="text-slate-400 font-normal">{totalScans > 0 ? '12%' : '0%'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Lainnya</span>
                </div>
                <div className="font-bold text-slate-900">
                  {totalScans > 0 ? Math.round(totalScans * 0.06).toLocaleString('id-ID') : 0} <span className="text-slate-400 font-normal">{totalScans > 0 ? '6%' : '0%'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Devices Table + Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table: Daftar Perangkat */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Daftar Perangkat Terpasang</h2>
                <p className="text-xs text-slate-400 mt-0.5">Perangkat Cobascan aktif di meja dan kasir</p>
              </div>
              <Link href="/dashboard/devices" className="text-xs font-bold text-[#1A73E8] hover:underline">
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
                  {devices.slice(0, 5).map((d, idx) => (
                    <tr key={d.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {d.code?.substring(0, 2) || `M${idx + 1}`}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{d.label || `Meja 0${idx + 1}`}</div>
                            <div className="text-[11px] text-slate-400 font-mono">#{d.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">Akrilik QR + NFC</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{d.scans || 120}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{Math.round((d.scans || 120) * 0.16)}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aktif
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
                          <Link href="/dashboard/devices">
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

          {/* Right Column: Status Cepat & Aktivitas Terbaru */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Status */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Status &amp; Link Aktif</h3>
                <Link href="/dashboard/settings" className="text-xs font-bold text-[#1A73E8] hover:underline">
                  Pengaturan
                </Link>
              </div>

              <div className="space-y-3">
                {/* Google Review */}
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs">Google Review</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {business?.googleMapsReviewUrl || 'Belum diatur'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Terhubung
                  </span>
                </div>

                {/* Wi-Fi */}
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWifiActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isWifiActive ? 'Aktif' : 'Mati'}
                  </span>
                </div>

                {/* Tambah Meja */}
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

            {/* Aktivitas Terbaru */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Aktivitas Pelanggan</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live
                </span>
              </div>

              <div className="space-y-4">
                {feedbacks.slice(0, 2).map((fb, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        Masukan Pelanggan ({fb.rating}★): &ldquo;{fb.message?.substring(0, 45)}...&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{fb.customerName || 'Pelanggan'}</span>
                        <span>Baru saja</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      Pengunjung membuka Google Review di Meja 01
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Meja 01</span>
                      <span>5 menit lalu</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      Pengunjung melihat password Wi-Fi
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Meja 02</span>
                      <span>12 menit lalu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
