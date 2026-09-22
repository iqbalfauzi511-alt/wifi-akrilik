import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  Radio,
  Building,
  BarChart3,
  CheckCircle2,
  Package,
  ShoppingBag,
  ShieldOff,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
  Download,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Cpu,
  Zap,
  Activity,
  Check,
  Search,
  Filter,
  Wifi,
  Star,
} from 'lucide-react';
import { getAdminStats } from '@/lib/db/queries/stats';
import { getAllQrsAdmin, getAllBatchesAdmin } from '@/lib/db/queries/qr';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AdminQrManager from '@/components/admin/AdminQrManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cobascan Admin Center — Hardware Console',
  description: 'Manufacturing batches, hardware provisioning, device fleet metrics, and partner businesses.',
};

export default async function AdminDashboardPage() {
  const [stats, allQrs, batches] = await Promise.all([
    getAdminStats().catch((err) => {
      console.warn('getAdminStats error:', err?.message || err);
      return {};
    }),
    getAllQrsAdmin().catch((err) => {
      console.warn('getAllQrsAdmin error:', err?.message || err);
      return [];
    }),
    getAllBatchesAdmin().catch((err) => {
      console.warn('getAllBatchesAdmin error:', err?.message || err);
      return [];
    }),
  ]);

  // Dynamic calculated ratios from real database queries
  const totalNodes = stats.totalQr || 0;
  const activeNodes = stats.activeQr || 0;
  const stockNodes = (stats.availableQr || 0) + (stats.soldQr || 0);
  const disabledNodes = stats.disabledQr || 0;
  const activePercent = totalNodes > 0 ? ((activeNodes / totalNodes) * 100).toFixed(1) : '0.0';
  const stockPercent = totalNodes > 0 ? ((stockNodes / totalNodes) * 100).toFixed(1) : '0.0';
  const disabledPercent = totalNodes > 0 ? ((disabledNodes / totalNodes) * 100).toFixed(1) : '0.0';
  const totalVenues = stats.totalBusinesses || 0;
  const avgNodesPerVenue = totalVenues > 0 ? (totalNodes / totalVenues).toFixed(1) : '0.0';
  const globalInteractions = stats.totalScans || 0;
  const recentScans7d = stats.recentScans7d || 0;
  const recentActivations30d = stats.recentActivations30d || 0;
  const nodesThisMonth = stats.nodesThisMonth || 0;
  const wifiBizCount = stats.wifiBizCount || 0;
  const reviewOnlyBizCount = stats.reviewOnlyBizCount || 0;
  const wifiBizPercent = totalVenues > 0 ? ((wifiBizCount / totalVenues) * 100).toFixed(1) : '0.0';
  const reviewOnlyPercent = totalVenues > 0 ? ((reviewOnlyBizCount / totalVenues) * 100).toFixed(1) : '0.0';
  const activationRate = totalNodes > 0 ? (((activeNodes + (stats.soldQr || 0)) / totalNodes) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header: Cobascan Admin Center (Hardware Console) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DATABASE CONNECTED
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
              Engine: PostgreSQL Supabase (Production)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cobascan Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manufacturing batches, hardware provisioning, device fleet metrics, and partner businesses.
          </p>
        </div>

        {/* Top Actions & Fleet Sync Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">FLEET SYNC ACTIVE</span>
          </div>

          <Link href="/admin/users">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Manifest</span>
            </button>
          </Link>

          <Link href="/admin/qr">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Batch</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 7 KPI METRICS CARDS ROW (Exact Match from Image 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* TOTAL DEVICES */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">TOTAL DEVICES</span>
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {totalNodes.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
            {nodesThisMonth > 0 ? `+${nodesThisMonth} unit bulan ini` : `${activeNodes} aktif terhubung`}
          </p>
        </div>

        {/* ACTIVE & DEPLOYED */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">ACTIVE &amp; DEPLOYED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeNodes.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{activePercent}% Fleet Ratio</p>
        </div>

        {/* AVAILABLE STOCK */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">AVAILABLE STOCK</span>
            <Package className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stockNodes.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Packaged &amp; Flashed</p>
        </div>

        {/* DISABLED / RETIRED */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">DISABLED/RETIRED</span>
            <ShieldOff className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {disabledNodes}
            </span>
          </div>
          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{disabledPercent}% attrition</p>
        </div>

        {/* PARTNER VENUES */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">PARTNER VENUES</span>
            <Building className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {totalVenues}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Avg {avgNodesPerVenue} nodes/venue</p>
        </div>

        {/* GLOBAL INTERACTIONS */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">GLOBAL INTERACTIONS</span>
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {globalInteractions.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
            {recentScans7d > 0 ? `+${recentScans7d.toLocaleString()} 7 hari terakhir` : 'Akumulasi Real-Time'}
          </p>
        </div>

        {/* ACTIVATION RATE */}
        <div className="p-3.5 bento-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">ACTIVATION RATE</span>
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {activationRate}%
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">High Conversion</p>
        </div>
      </div>

      {/* SECTION 1: Batch Provisioning & QR Generator */}
      <div className="bento-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-google-blue font-mono">
                PENCETAKAN QR
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Batch Provisioning &amp; Generator QR
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Cetak batch kode QR unik secara massal untuk digunakan oleh bisnis mitra.
              </p>
            </div>

            {/* Quick Batch Presets */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">Cetak Cepat:</span>
              <Link href="/admin/qr">
                <div className="flex items-center gap-1">
                  {[6, 10, 50, 100, 500].map((qty) => (
                    <span
                      key={qty}
                      className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-slate-50 hover:bg-blue-50 hover:text-google-blue text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {qty}
                    </span>
                  ))}
                </div>
              </Link>
            </div>
          </div>

          {/* Batch Cards Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
            {(Array.isArray(batches) ? batches : []).slice(0, 3).map((b, idx) => {
              const total = b.totalQrs || 0;
              const active = b.activeQrs || 0;
              const available = Math.max(0, total - active);
              const percent = total > 0 ? Math.round((active / total) * 100) : 0;
              const isFirst = idx === 0;

              return (
                <div
                  key={b.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        {b.batchCode || 'BATCH'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFirst
                            ? 'bg-emerald-50 text-google-green border border-emerald-200'
                            : 'bg-blue-50 text-google-blue border border-blue-200'
                        }`}
                      >
                        {isFirst ? 'Deployed' : 'Active Mint'}
                      </span>
                    </div>

                    <div className="text-xl font-black text-slate-900 tracking-tight mt-2">
                      {total} Units
                    </div>

                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Tersedia:</span>
                        <strong className="text-slate-800">{available} units</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Terpasang:</span>
                        <strong className="text-google-green">{active} units</strong>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                        <span>Tanggal:</span>
                        <span>
                          {b?.createdAt
                            ? new Date(b.createdAt).toLocaleDateString('id-ID', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Baru'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-google-blue h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Placeholder Card if fewer than 3 batches */}
            {batches.length < 3 && (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-white flex flex-col justify-center items-center text-center">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-google-blue flex items-center justify-center mb-2">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Buat Batch Baru</h4>
                <p className="text-[11px] text-slate-500 mt-1">Cetak kode QR fisik baru</p>
                <Link href="/admin/qr" className="mt-3">
                  <Button size="sm" variant="outline" className="text-xs">
                    + Tambah Batch
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Route Preview */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-google-green animate-pulse" />
            <span className="font-mono text-[11px]">Rute publik: <strong>/q/:code</strong></span>
          </div>
          <Link
            href="/admin/qr"
            className="inline-flex items-center gap-1 text-google-blue hover:text-blue-800 font-semibold text-xs"
          >
            <span>Buka Generator Batch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ANALYTICS ROW: Fleet Distribution + Activation Velocity + Tap vs Scan Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Fleet Distribution */}
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fleet Distribution</h3>
              <p className="text-[11px] text-slate-400">Physical hardware lifecycle state</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          {/* Donut Chart Visual */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* SVG Donut */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Active Segment (Emerald) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${activePercent}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Stock Segment (Amber) */}
                <path
                  className="text-amber-400"
                  strokeDasharray={`${stockPercent}, 100`}
                  strokeDashoffset={`-${activePercent}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Center Content */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {totalNodes > 1000 ? `${(totalNodes / 1000).toFixed(1)}k` : totalNodes}
                </span>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">NODES</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Active {activePercent}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Stock {stockPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Retired {disabledPercent}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Laju Aktivasi Armada (Live Real-Time Data) */}
        <div className="bento-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Laju Aktivasi Armada</h3>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">
                    +{recentActivations30d} Unit (30 Hari)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Stand fisik diaktivasi dalam 30 hari terakhir</p>
              </div>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>

            {/* Live Progress Bar & Breakdown */}
            <div className="mt-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {activationRate}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeNodes} dari {totalNodes} stand aktif
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${activePercent}%` }}
                  title={`Aktif: ${activePercent}%`}
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${stockPercent}%` }}
                  title={`Tersedia: ${stockPercent}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Aktif Terpasang</div>
                  <div className="text-sm font-extrabold text-emerald-900 font-mono mt-0.5">{activeNodes} Unit</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Stok / Blank</div>
                  <div className="text-sm font-extrabold text-amber-900 font-mono mt-0.5">{stockNodes} Unit</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
            <span>Total Armada Terdaftar:</span>
            <span className="font-bold text-slate-700">{totalNodes.toLocaleString()} Unit</span>
          </div>
        </div>

        {/* Card 3: Adopsi Fitur Mitra (Live Real-Time Data) */}
        <div className="bento-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adopsi Fitur Mitra Bisnis</h3>
                <p className="text-[11px] text-slate-400">Distribusi konfigurasi Wi-Fi vs Google Maps Direct</p>
              </div>
              <Building className="w-4 h-4 text-indigo-600" />
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Wifi className="w-3.5 h-3.5 text-brand-600" />
                    <span>Wi-Fi Tamu + Google Maps</span>
                  </div>
                  <div className="font-mono text-slate-700">
                    <strong>{wifiBizPercent}%</strong> <span className="text-[10px] text-slate-400">({wifiBizCount} Mitra)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{ width: `${wifiBizPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Direct Google Maps Saja</span>
                  </div>
                  <div className="font-mono text-slate-700">
                    <strong>{reviewOnlyPercent}%</strong> <span className="text-[10px] text-slate-400">({reviewOnlyBizCount} Mitra)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${reviewOnlyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-100">
            <span>Total Mitra Terdaftar:</span>
            <span className="font-bold text-indigo-600">{totalVenues} Bisnis Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Device Registry & Fleet Management Table (Exact Match from Image 1) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
              SECTION 2
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Device Registry &amp; Fleet Management Table
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live provisioned nodes, assignment logs, cloud routing switches, and cryptographic resets.
            </p>
          </div>
        </div>

        {/* Embedded Interactive Fleet Table */}
        <AdminQrManager initialQrs={Array.isArray(allQrs) ? allQrs : []} />
      </div>
    </div>
  );
}
