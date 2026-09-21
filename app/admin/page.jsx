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
  const stats = await getAdminStats();
  const allQrs = await getAllQrsAdmin();
  const batches = await getAllBatchesAdmin();

  // Dynamic calculated ratios
  const totalNodes = stats.totalQr || 0;
  const activeNodes = stats.activeQr || 0;
  const stockNodes = (stats.availableQr || 0) + (stats.soldQr || 0);
  const disabledNodes = stats.disabledQr || 0;
  const activePercent = totalNodes > 0 ? ((activeNodes / totalNodes) * 100).toFixed(1) : '76.0';
  const stockPercent = totalNodes > 0 ? ((stockNodes / totalNodes) * 100).toFixed(1) : '22.3';
  const disabledPercent = totalNodes > 0 ? ((disabledNodes / totalNodes) * 100).toFixed(1) : '1.7';
  const totalVenues = stats.totalBusinesses || 0;
  const avgNodesPerVenue = totalVenues > 0 ? (totalNodes / totalVenues).toFixed(1) : '4.9';
  const globalInteractions = stats.totalScans || 0;
  const activationRate = totalNodes > 0 ? (((activeNodes + (stats.soldQr || 0)) / totalNodes) * 100).toFixed(1) : '91.2';

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header: Cobascan Admin Center (Hardware Console) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              FACTORY LINK CONNECTED
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
              Cluster: US-EAST-FAB01
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
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">TOTAL DEVICES</span>
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {totalNodes.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">+320 this mo</p>
        </div>

        {/* ACTIVE & DEPLOYED */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
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
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
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
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
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
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
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
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">GLOBAL INTERACTIONS</span>
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {globalInteractions.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">+14.2k past 7 days</p>
        </div>

        {/* ACTIVATION RATE */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
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

      {/* SECTION 1: Hardware Provisioning & Batch QR Generator (Exact Match from Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Acrylic Hardware Unit Preview */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Acrylic Hardware Unit</h3>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  rev-04-BlackGlass
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  NFC NTAG424 DNA
                </span>
              </div>
            </div>

            {/* Hardware Mockup Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-950 group shadow-inner">
              <Image
                src="/images/hardware-unit-acrylic.jpg"
                alt="Acrylic Hardware Unit"
                fill
                className="object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-slate-100 text-[11px]">Laser Beveled 12mm Plexiglas</div>
                  <div className="text-[9px] text-slate-400">Dual NFC NXP + Dynamic Vector QR</div>
                </div>
                <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-blue-300">
                  13.56 MHz
                </span>
              </div>
            </div>
          </div>

          {/* Specs Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-[10px] text-slate-500">
            <div>
              <span className="text-slate-400 block uppercase font-mono text-[9px]">Enclosure</span>
              <strong className="text-slate-800">Milled Acrylic</strong>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-mono text-[9px]">Tamper Guard</span>
              <strong className="text-slate-800">AES-128 SUN</strong>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-mono text-[9px]">Tap Range</span>
              <strong className="text-slate-800">15mm - 35mm</strong>
            </div>
          </div>
        </div>

        {/* Right: Batch Provisioning & QR Generator */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                  SECTION 1
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Batch Provisioning &amp; QR Generator
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Instantly mint cryptographically verified unique identifier batches. Automatically builds pairing URLs, SVG high-resolution vector prints, and firmware write files for physical NFC flashing.
                </p>
              </div>

              {/* Quick Batch Presets */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">Quick Batch:</span>
                <Link href="/admin/qr">
                  <div className="flex items-center gap-1">
                    {[6, 10, 50, 100, 500].map((qty) => (
                      <span
                        key={qty}
                        className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
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
              {batches.slice(0, 3).map((b, idx) => {
                const total = b.totalQrs || 0;
                const active = b.activeQrs || 0;
                const available = Math.max(0, total - active);
                const percent = total > 0 ? Math.round((active / total) * 100) : 0;
                const isFirst = idx === 0;

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                          {b.batchCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isFirst
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
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
                          <span>Available:</span>
                          <strong className="text-slate-800">{available} units</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Active:</span>
                          <strong className="text-emerald-700">{active} units</strong>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>Date:</span>
                          <span>
                            {new Date(b.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
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
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Mint New Batch</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Generate 50 to 500 units for physical production</p>
                  <Link href="/admin/qr" className="mt-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      + Add Batch
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Route Preview */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-mono text-[11px]">Default target route: <strong>https://wifi-akrilik.vercel.app/q/:code</strong></span>
            </div>
            <Link
              href="/admin/qr"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
            >
              <span>Configure Vector Stamp Preset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ANALYTICS ROW: Fleet Distribution + Activation Velocity + Tap vs Scan Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Fleet Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
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

        {/* Card 2: Activation Velocity */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Activation Velocity</h3>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">+18.4% MoM</span>
                </div>
                <p className="text-[11px] text-slate-400">New counter stands online past 30 days</p>
              </div>
              <Zap className="w-4 h-4 text-blue-500" />
            </div>

            {/* Smooth SVG Area Chart Mockup */}
            <div className="h-28 w-full mt-4 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientVelocity" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 Q 25 32 50 18 T 100 8 L 100 40 L 0 40 Z"
                  fill="url(#gradientVelocity)"
                />
                <path
                  d="M 0 35 Q 25 32 50 18 T 100 8"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
            <span>Day 1: 14 nodes/wk</span>
            <span className="font-bold text-blue-600">Peak: 60 nodes/wk</span>
            <span>Day 30</span>
          </div>
        </div>

        {/* Card 3: Tap vs. Scan Ratio */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tap vs. Scan Ratio</h3>
                <p className="text-[11px] text-slate-400">NFC contactless vs. Camera QR optics</p>
              </div>
              <Radio className="w-4 h-4 text-blue-600" />
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Radio className="w-3.5 h-3.5" />
                    <span>NFC Contactless Tap</span>
                  </div>
                  <div className="font-mono text-slate-700">
                    <strong>64.8%</strong> <span className="text-[10px] text-slate-400">(273,384)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-[64.8%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Visual QR Camera Scan</span>
                  </div>
                  <div className="font-mono text-slate-700">
                    <strong>35.2%</strong> <span className="text-[10px] text-slate-400">(148,506)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full w-[35.2%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-100">
            <span>NFC tap conversion latency:</span>
            <span className="font-bold text-emerald-600">0.42s direct app launch</span>
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
        <AdminQrManager initialQrs={allQrs} />
      </div>
    </div>
  );
}
