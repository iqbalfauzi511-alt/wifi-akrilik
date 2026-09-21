import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Building,
  BarChart3,
  CheckCircle2,
  Package,
  ShoppingBag,
  ShieldOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getAdminStats } from '@/lib/db/queries/stats';
import { getAllQrsAdmin } from '@/lib/db/queries/qr';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard — Smart Wi-Fi',
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const recentQrs = await getAllQrsAdmin();

  return (
    <div className="space-y-8">
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase mb-1.5">
            Platform Owner
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Smart Wi-Fi Admin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau inventori QR Code fisik, bisnis terdaftar, dan akumulasi seluruh scan pengunjung.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/qr">
            <Button size="sm" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Kelola & Generate QR
            </Button>
          </Link>
        </div>
      </div>

      {/* 7 Core Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total QR"
          value={stats.totalQr}
          subtitle="Seluruh QR tercatat"
          icon={QrCode}
          color="slate"
        />
        <StatCard
          title="Available (Blank)"
          value={stats.availableQr}
          subtitle="QR belum terjual"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Sold QR"
          value={stats.soldQr}
          subtitle="Terjual belum aktif"
          icon={ShoppingBag}
          color="amber"
        />
        <StatCard
          title="Active QR"
          value={stats.activeQr}
          subtitle="Terpasang di kafe"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Disabled QR"
          value={stats.disabledQr}
          subtitle="Dinonaktifkan"
          icon={ShieldOff}
          color="rose"
        />
        <StatCard
          title="Total Businesses"
          value={stats.totalBusinesses}
          subtitle="Bisnis/Kafe mitra"
          icon={Building}
          color="purple"
        />
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          subtitle="Pengunjung scan QR"
          icon={BarChart3}
          color="emerald"
        />
      </div>

      {/* Recent QR Codes Table */}
      <Card>
        <CardHeader
          title="QR Code Terbaru"
          subtitle="5 QR Code terakhir yang dibuat di platform"
          action={
            <Link href="/admin/qr">
              <Button variant="ghost" size="sm" className="text-xs">
                Lihat Seluruh QR ({stats.totalQr}) &rarr;
              </Button>
            </Link>
          }
        />

        {recentQrs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Belum ada QR Code. Klik tombol &quot;Kelola &amp; Generate QR&quot; untuk membuat batch pertama.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Kode QR</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Bisnis</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Total Scan</th>
                  <th className="py-3.5 px-4 font-semibold">Dibuat</th>
                  <th className="py-3.5 px-4 font-semibold">Diaktifkan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQrs.slice(0, 5).map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {qr.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={qr.status} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {qr.businessName || <span className="text-slate-400 italic">Belum terhubung</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {qr.scanCount}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(qr.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {qr.activatedAt
                        ? new Date(qr.activatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
