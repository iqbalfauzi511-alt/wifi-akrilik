import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Wifi,
  Instagram,
  MapPin,
  Star,
  Building,
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
import CustomerQrTable from '@/components/customer/CustomerQrTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — Smart Wi-Fi',
};

export default async function CustomerDashboardPage() {
  const session = await getCurrentSession();

  // Admin manages the platform at /admin, not a customer cafe profile
  if (session?.role === 'admin') {
    redirect('/admin');
  }

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
              ? `Kelola rating Google Maps dan opsi akses Wi-Fi untuk ${business.businessName}.`
              : 'Selamat datang! Silakan daftarkan profil bisnis Anda atau aktivasi Smart QR & NFC fisik.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Smart QR
            </Button>
          </Link>
          <Link href="/dashboard/qr">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <QrCode className="w-3.5 h-3.5" />
              Kelola QR &amp; NFC
            </Button>
          </Link>
        </div>
      </div>

      {/* If customer hasn't set up business yet */}
      {!business ? (
        <Card className="border-brand-200 bg-brand-50/40 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 fill-brand-600 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Belum Ada Bisnis Terdaftar
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5">
            Anda dapat mendaftarkan informasi bisnis Anda sekarang atau cukup scan QR Code fisik / tap NFC yang Anda terima untuk mengaktifkannya.
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
            {/* Business Settings Card */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/80 border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                    Pengaturan Aktif
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Business Settings
                  </h3>
                </div>
                <Link href="/dashboard/settings">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 shadow-xs bg-white hover:bg-slate-50">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edit Business</span>
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
                {/* Nama Bisnis */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nama Bisnis</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                    {business.businessName}
                  </p>
                </div>

                {/* Google Maps Review */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Link Review Google Maps</span>
                  </div>
                  {(business.googleMapsReviewUrl || business.googleMapsUrl) ? (
                    <a
                      href={business.googleMapsReviewUrl || business.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-900 hover:text-brand-600 mt-1.5 flex items-center gap-1 truncate"
                      title={business.googleMapsReviewUrl || business.googleMapsUrl}
                    >
                      <span className="truncate">{business.googleMapsReviewUrl || business.googleMapsUrl}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 mt-1.5 block">Belum diatur</span>
                  )}
                </div>

                {/* Wi-Fi Status */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-brand-500" />
                      <span>Wi-Fi</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      business.wifiEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {business.wifiEnabled ? '✓ Aktif' : '— Nonaktif'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                    {business.wifiEnabled ? 'Akses Wi-Fi Diaktifkan' : 'Hanya Google Maps'}
                  </p>
                </div>

                {/* Wi-Fi Name (SSID) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Wifi className="w-3.5 h-3.5 text-slate-400" />
                    <span>Wi-Fi Name</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                    {business.wifiEnabled && business.wifiName ? business.wifiName : '—'}
                  </p>
                </div>

                {/* Password Wi-Fi */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 sm:col-span-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      <span>Password</span>
                    </div>
                    <Link href="/dashboard/settings" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline">
                      {business.wifiEnabled ? 'Ubah di Settings' : 'Aktifkan'}
                    </Link>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-1.5 truncate tracking-widest">
                    {business.wifiEnabled && business.wifiPassword ? '••••••••••' : '—'}
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

          {/* Recent QRs preview with Barcode Viewer & Download */}
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

            <CustomerQrTable
              qrList={myQrs.slice(0, 5)}
              businessName={business.businessName}
            />
          </Card>
        </>
      )}
    </div>
  );
}
