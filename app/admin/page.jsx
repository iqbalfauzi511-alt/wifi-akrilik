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
  Layers,
  Users,
} from 'lucide-react';
import { getAdminStats } from '@/lib/db/queries/stats';
import { getAllQrsAdmin, getAllBatchesAdmin } from '@/lib/db/queries/qr';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ringkasan Platform — Cobascan Admin',
  description: 'Pusat kontrol dan ringkasan ekosistem Cobascan.',
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const recentQrs = await getAllQrsAdmin();
  const batches = await getAllBatchesAdmin();

  return (
    <div className="space-y-8">
      {/* Admin Title Banner: Ringkasan Platform */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase mb-1.5">
            Admin Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ringkasan Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Pusat kontrol dan ikhtisar ekosistem Cobascan: inventori perangkat (QR &amp; NFC), paket batch, mitra bisnis, serta total interaksi pelanggan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Kelola Pengguna
            </Button>
          </Link>
          <Link href="/admin/qr">
            <Button size="sm" className="gap-1.5 text-xs shadow-sm shadow-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Kelola &amp; Generate QR
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

      {/* Batches Overview Card */}
      {batches.length > 0 && (
        <Card>
          <CardHeader
            title="Paket Batch Terdaftar"
            subtitle="Inventori paket perangkat Cobascan yang telah di-generate"
            action={
              <Link href="/admin/qr">
                <Button variant="ghost" size="sm" className="text-xs">
                  Kelola Seluruh Batch ({batches.length}) &rarr;
                </Button>
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 pt-0">
            {batches.slice(0, 4).map((b) => {
              const activeRatio = b.totalQrs > 0 ? Math.round((b.activeQrs / b.totalQrs) * 100) : 0;
              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {b.batchCode}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeRatio === 100
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeRatio > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {activeRatio}% Aktif
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      <span>{b.activeQrs} dari {b.totalQrs} perangkat aktif</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all"
                        style={{ width: `${activeRatio}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    Dibuat: {new Date(b.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent QR Codes Table */}
      <Card>
        <CardHeader
          title="Perangkat Cobascan Terbaru"
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
                  <th className="py-3.5 px-3 font-semibold text-center">Maps</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Wi-Fi</th>
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
                    <td className="py-3.5 px-3 text-center">
                      {(qr.googleMapsReviewUrl || qr.googleMapsUrl) ? (
                        <span className="text-emerald-700 font-bold text-xs">✓</span>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {qr.wifiEnabled ? (
                        <span className="text-brand-600 font-bold text-xs">✓</span>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
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
