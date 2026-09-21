import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  QrCode,
  Radio,
  Star,
  Wifi,
  Building,
  BarChart3,
  Settings,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  KeyRound,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getCustomerStats, getCustomerStatsByUserId } from '@/lib/db/queries/stats';
import { getQrsByBusinessId, getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import CustomerQrTable from '@/components/customer/CustomerQrTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — Cobascan',
};

export default async function CustomerDashboardPage() {
  const session = await getCurrentSession();

  // Admin manages the platform at /admin, not a customer cafe profile
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const myQrs = userId ? await getQrsByOwnerUserId(userId) : [];
  const stats = userId ? await getCustomerStatsByUserId(userId) : { activeQrCount: 0, totalScans: 0 };
  const business = session?.business || (myQrs.length > 0 ? {
    id: myQrs[0].businessId,
    businessName: myQrs[0].businessName,
    googleMapsReviewUrl: myQrs[0].googleMapsReviewUrl || myQrs[0].googleMapsUrl,
    googleMapsUrl: myQrs[0].googleMapsUrl,
    wifiEnabled: myQrs[0].wifiEnabled,
  } : null);

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
              ? `Kelola Cobascan, Google Review, dan akses Wi-Fi untuk ${business.businessName}.`
              : 'Selamat datang! Silakan daftarkan profil bisnis Anda atau aktivasi perangkat Cobascan (QR + NFC).'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Bisnis
            </Button>
          </Link>
          <Link href="/dashboard/qr">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <QrCode className="w-3.5 h-3.5" />
              Perangkat Cobascan
            </Button>
          </Link>
        </div>
      </div>

      {/* If customer hasn't set up business yet */}
      {!business ? (
        <Card className="border-brand-200 bg-brand-50/40 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Belum Ada Bisnis Terdaftar
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5">
            Anda dapat melengkapi profil bisnis Anda sekarang atau cukup scan QR Code / tap NFC pada produk Cobascan fisik untuk mengaktifkannya.
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
          {/* Main Grid: Primary Cobascan Status & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Card: Cobascan Anda */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/80 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Cobascan Anda
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    QR &amp; NFC aktif dan siap digunakan pelanggan.
                  </p>
                </div>

                <Link href="/dashboard/settings">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 shadow-xs bg-white hover:bg-slate-50">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edit Settings</span>
                  </Button>
                </Link>
              </div>

              {/* Fitur Priority Display */}
              <div className="space-y-4 pt-5">
                {/* FITUR 1 (UTAMA): Google Review */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 transition-all hover:bg-amber-50/80">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">Google Review</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                            Fungsi Utama
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Arahkan pelanggan langsung ke halaman review bisnis.
                        </p>
                      </div>
                    </div>

                    {(business.googleMapsReviewUrl || business.googleMapsUrl) ? (
                      <a
                        href={business.googleMapsReviewUrl || business.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100/70 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <span>Lihat Link Review</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href="/dashboard/settings"
                        className="text-xs font-semibold text-amber-800 hover:underline"
                      >
                        Atur Link Review &rarr;
                      </Link>
                    )}
                  </div>

                  {(business.googleMapsReviewUrl || business.googleMapsUrl) && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center gap-2 text-[11px] text-slate-600 font-mono truncate">
                      <span className="text-slate-400 font-sans">URL:</span>
                      <span className="truncate">{business.googleMapsReviewUrl || business.googleMapsUrl}</span>
                    </div>
                  )}
                </div>

                {/* FITUR 2 (TAMBAHAN): Wi-Fi Access */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all hover:bg-slate-50/90">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Wifi className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">Wi-Fi Access</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            business.wifiEnabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {business.wifiEnabled ? '✓ Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Berikan akses Wi-Fi kepada pelanggan melalui Cobascan.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline shrink-0"
                    >
                      {business.wifiEnabled ? 'Ubah Kredensial' : 'Aktifkan Wi-Fi'}
                    </Link>
                  </div>

                  {business.wifiEnabled && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">Nama Wi-Fi:</span>{' '}
                        <strong className="text-slate-900">{business.wifiName || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Password:</span>{' '}
                        <span className="font-mono font-bold text-slate-900 tracking-wider">••••••••••</span>
                      </div>
                      {myQrs.length > 0 && (
                        <a
                          href={`/q/${myQrs[0].code}/wifi`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 ml-auto"
                        >
                          <span>Halaman Review &amp; Wi-Fi Tamu</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Profil Bisnis Info */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bisnis: <strong className="text-slate-800">{business.businessName}</strong></span>
                  </div>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Radio className="w-3.5 h-3.5 text-amber-500" />
                    QR Scan &bull; NFC Tap terhubung
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Action / Hardware Overview Tile */}
            <Card className="flex flex-col justify-between bg-slate-900 text-white border-slate-800">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 mb-4">
                  <Radio className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Tambah Perangkat Cobascan</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Punya produk fisik Cobascan baru? Cukup scan kode QR atau tap HP ke chip NFC produk tersebut untuk menautkannya ke {business.businessName}.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                  💡 <strong>Satu URL untuk QR &amp; NFC:</strong> Pengunjung scan QR atau tap NFC diarahkan ke halaman yang sama secara otomatis.
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/dashboard/qr" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Lihat Seluruh Cobascan ({myQrs.length})
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StatCard
              title="Perangkat Cobascan Aktif"
              value={stats.activeQrCount}
              subtitle="Total perangkat QR & NFC aktif di lokasi bisnis Anda"
              icon={QrCode}
              color="blue"
            />
            <StatCard
              title="Total Scan & Tap"
              value={stats.totalScans}
              subtitle="Akumulasi interaksi pelanggan melalui QR scan & NFC tap"
              icon={BarChart3}
              color="emerald"
            />
          </div>

          {/* Recent Cobascan Devices preview with Barcode Viewer & Download */}
          <Card>
            <CardHeader
              title="Perangkat Cobascan Terpasang"
              subtitle="Daftar perangkat QR & NFC aktif yang terhubung ke bisnis Anda"
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
              wifiEnabled={business.wifiEnabled}
            />
          </Card>
        </>
      )}
    </div>
  );
}
