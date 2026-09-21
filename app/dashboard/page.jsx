import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Instagram,
  QrCode,
  BarChart3,
  Settings,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  KeyRound,
} from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getCustomerStats } from '@/lib/db/queries/stats';
import { getQrsByBusinessId } from '@/lib/db/queries/qr';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — Smart Wi-Fi',
};

export default async function CustomerDashboardPage() {
  const session = await getCurrentSession();
  const business = session?.business;

  const stats = await getCustomerStats(business?.id);
  const myQrs = business ? await getQrsByBusinessId(business.id) : [];

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Partner';

  return (
    <div className="space-y-8">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Halo, {userName} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {business
              ? `Kelola koneksi Wi-Fi dan pantau interaksi pengunjung di ${business.businessName}.`
              : 'Selamat datang! Silakan daftarkan profil bisnis Anda atau aktivasi QR fisik.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Wi-Fi
            </Button>
          </Link>
          <Link href="/dashboard/qr">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <QrCode className="w-3.5 h-3.5" />
              Kelola QR
            </Button>
          </Link>
        </div>
      </div>

      {/* If customer hasn't set up business yet */}
      {!business ? (
        <Card className="border-brand-200 bg-brand-50/40 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Belum Ada Bisnis Terdaftar
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5">
            Anda dapat mendaftarkan informasi kafe Anda sekarang atau cukup scan QR Code fisik yang Anda terima untuk mengaktifkannya.
          </p>
          <Link href="/dashboard/setup">
            <Button size="md">
              Atur Profil Bisnis Sekarang
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Active Business Overview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Info Tile */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/80 border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                    Bisnis Anda
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {business.businessName}
                  </h3>
                </div>
                <Link href="/dashboard/settings">
                  <span className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                    Edit Data &rarr;
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/70">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram</span>
                  </div>
                  <a
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-900 hover:text-brand-600 mt-1 block truncate"
                  >
                    {business.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, '@') || business.instagramUrl}
                  </a>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Wifi className="w-3.5 h-3.5 text-brand-500" />
                    <span>Nama Wi-Fi (SSID)</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {business.wifiName}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Password Wi-Fi</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-1 truncate">
                    {business.wifiPassword}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Action Tile */}
            <Card className="flex flex-col justify-between bg-slate-900 text-white border-slate-800">
              <div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-brand-400 mb-3">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Tambah Meja / QR Baru</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Punya produk akrilik baru? Cukup scan kode QR pada produk tersebut untuk menautkannya ke {business.businessName}.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800">
                <Link href="/dashboard/qr" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Lihat Seluruh QR ({myQrs.length})
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StatCard
              title="QR Code Aktif"
              value={stats.activeQrCount}
              subtitle="QR akrilik yang sedang terpasang di meja bisnis Anda"
              icon={QrCode}
              color="blue"
            />
            <StatCard
              title="Total Pengunjung Scan"
              value={stats.totalScans}
              subtitle="Akumulasi seluruh pengunjung yang scan QR dan melihat Wi-Fi"
              icon={BarChart3}
              color="emerald"
            />
          </div>

          {/* Recent QRs preview */}
          <Card>
            <CardHeader
              title="QR Code Terpasang"
              subtitle="Daftar QR akrilik aktif yang terhubung ke bisnis Anda"
              action={
                <Link href="/dashboard/qr">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Kelola Semua &rarr;
                  </Button>
                </Link>
              }
            />

            {myQrs.length === 0 ? (
              <EmptyState
                title="Belum Ada QR Terhubung"
                description="Scan kode QR fisik pertama Anda dengan kamera smartphone untuk menghubungkannya ke bisnis ini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Kode QR</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-center">Total Scan</th>
                      <th className="py-3 px-4 font-semibold">Tanggal Aktivasi</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myQrs.slice(0, 5).map((qr) => (
                      <tr key={qr.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {qr.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={qr.status} />
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                          {qr.scanCount}
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
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`/q/${qr.code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                          >
                            <span>Tes Scan</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
