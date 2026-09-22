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
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
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
  const [userBusinesses, myQrs, stats] = userId
    ? await Promise.all([
        getBusinessesByOwnerId(userId).catch(() => []),
        getQrsByOwnerUserId(userId).catch(() => []),
        getCustomerStatsByUserId(userId).catch(() => ({ activeQrCount: 0, totalScans: 0 })),
      ])
    : [(session?.businesses || []), [], { activeQrCount: 0, totalScans: 0 }];
  const business = userBusinesses[0] || session?.business || (myQrs.length > 0 ? {
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
            {userBusinesses.length > 1
              ? `Kelola ${userBusinesses.length} cabang bisnis (${userBusinesses.map((b) => b.businessName).join(', ')}), Google Review, dan akses Wi-Fi masing-masing.`
              : business
              ? `Kelola Perangkat, Google Review, dan akses Wi-Fi untuk ${business.businessName}.`
              : 'Selamat datang! Silakan daftarkan profil bisnis Anda atau aktivasi perangkat baru.'}
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
              Perangkat Aktif
            </Button>
          </Link>
        </div>
      </div>

      {/* If customer hasn't set up business yet */}
      {!business ? (
        <Card className="border-blue-200 bg-blue-50/40 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-google-blue flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6 text-google-blue" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Belum Ada Bisnis Terdaftar
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5">
            Anda dapat melengkapi profil bisnis Anda sekarang atau cukup scan QR Code pada perangkat fisik untuk mengaktifkannya.
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
                      Perangkat Anda
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-google-green border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-google-green" />
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Sistem aktif dan siap digunakan pelanggan.
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
                {(() => {
                  const rawMaps = (business.googleMapsReviewUrl || business.googleMapsUrl || '').trim();
                  const validMapsUrl = rawMaps
                    ? (rawMaps.startsWith('http://') || rawMaps.startsWith('https://') ? rawMaps : `https://${rawMaps}`)
                    : '';
                  return (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 transition-all hover:bg-amber-50 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">Google Review (Tujuan Scan Pelanggan)</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                                Fungsi Utama
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              URL Google Maps ini yang otomatis dibuka di HP pengunjung saat mereka scan QR atau tap NFC di meja cafe Anda.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {validMapsUrl ? (
                            <>
                              <a
                                href={validMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Buka Link Review</span>
                              </a>
                              <Link
                                href="/dashboard/settings"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/60 text-amber-900 text-xs font-semibold transition-colors"
                              >
                                <span>Ubah</span>
                              </Link>
                            </>
                          ) : (
                            <Link
                              href="/dashboard/settings"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                            >
                              <span>Atur Link Review &rarr;</span>
                            </Link>
                          )}
                        </div>
                      </div>

                      {validMapsUrl && (
                        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2 text-[11px] text-slate-600 font-mono">
                          <span className="truncate max-w-[280px] sm:max-w-md text-amber-950 font-semibold">{validMapsUrl}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold font-sans shrink-0">
                            ✓ Terhubung
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

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
            {/* Quick Tips / Actions */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <QrCode className="w-24 h-24" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-google-blue" />
                  Punya Cabang Lain?
                </h4>
                <p className="text-xs text-slate-500 mt-2 relative z-10 leading-relaxed">
                  Punya perangkat baru? Cukup scan kode QR produk tersebut untuk mendaftarkannya sebagai cabang baru atau menautkannya ke {business.businessName}.
                </p>
                <div className="mt-3 relative z-10 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    💡 <strong>Otomatis:</strong> Pengunjung scan QR diarahkan ke halaman khusus secara otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Device List & Activity (Simplified) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card className="border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-google-blue">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Total Perangkat</h3>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.totalQrs}</p>
              <p className="text-xs text-slate-500 mt-1">Perangkat aktif di lokasi bisnis Anda</p>
            </Card>

            <Card className="border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-google-green">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Total Scan</h3>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.totalScans}</p>
              <p className="text-xs text-slate-500 mt-1">Akumulasi interaksi pelanggan melalui QR scan</p>
            </Card>
          </div>

          {/* Quick Access to QR Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Perangkat Anda</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar perangkat aktif yang terhubung ke bisnis Anda
                </p>
              </div>
              <Link href="/dashboard/qr">
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  Lihat Semua
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Devices preview with Barcode Viewer & Download */}
          <Card>
            <CardHeader
              title="Perangkat Terpasang"
              subtitle="Daftar perangkat aktif yang terhubung ke bisnis Anda"
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
