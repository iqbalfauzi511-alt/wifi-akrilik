import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wifi, Copy, Check, ShieldCheck, Settings } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { updateBusinessSettingsAction } from '@/lib/actions/business-actions';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Wi-Fi: Cobascan Pemilik Bisnis',
};

export default async function CustomerWifiPage() {
  const session = await getCurrentSession();
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const userBusinesses = userId
    ? await getBusinessesByOwnerId(userId).catch(() => [])
    : [];

  const business = userBusinesses[0] || session?.business;

  async function handleToggleWifi(formData) {
    'use server';
    const enabled = formData.get('wifiEnabled') === 'true';
    const wifiName = formData.get('wifiName');
    const wifiPassword = formData.get('wifiPassword');

    if (!business?.id) return;

    await updateBusinessSettingsAction(business.id, {
      businessName: business.businessName,
      googleMapsReviewUrl: business.googleMapsReviewUrl,
      wifiEnabled: enabled,
      wifiName: wifiName || business.wifiName,
      wifiPassword: wifiPassword || business.wifiPassword,
    });
  }

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            Akses Wi-Fi Tamu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Kelola ketersediaan koneksi internet gratis untuk pelanggan yang memindai Cobascan di {business?.businessName || 'bisnis Anda'}.
          </p>
        </div>

        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Lengkap</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Configuration */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Status Wi-Fi Pengunjung</h2>
                <p className="text-xs text-slate-400">
                  {business?.wifiEnabled ? 'Aktif dan dapat dilihat pelanggan' : 'Nonaktif (disembunyikan dari pelanggan)'}
                </p>
              </div>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              business?.wifiEnabled
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {business?.wifiEnabled ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          <form action={handleToggleWifi} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Aktifkan Wi-Fi untuk Pelanggan?
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="wifiEnabled"
                    value="true"
                    defaultChecked={Boolean(business?.wifiEnabled)}
                    className="text-[#1A73E8] focus:ring-[#1A73E8]"
                  />
                  <span>Ya, Tampilkan Wi-Fi</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="wifiEnabled"
                    value="false"
                    defaultChecked={!business?.wifiEnabled}
                    className="text-[#1A73E8] focus:ring-[#1A73E8]"
                  />
                  <span>Tidak (Hanya Google Review)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nama Wi-Fi (SSID)
              </label>
              <input
                type="text"
                name="wifiName"
                defaultValue={business?.wifiName || 'KopiSenja_Guest'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Password Wi-Fi
              </label>
              <input
                type="text"
                name="wifiPassword"
                defaultValue={business?.wifiPassword || 'kopisenja2026'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Simpan Pengaturan Wi-Fi
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Guest Preview Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Preview Tampilan Pelanggan
          </div>

          {business?.wifiEnabled ? (
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>Wi-Fi Gratis</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Wi-Fi:</span>
                  <span className="font-bold text-slate-800">{business.wifiName || 'KopiSenja_Guest'}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Password:</span>
                    <span className="font-mono font-bold text-slate-800 tracking-wider">
                      {business.wifiPassword || 'kopisenja2026'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                    Salin
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pelanggan yang memindai QR Code di meja Anda akan langsung melihat kotak Wi-Fi ini dan dapat menyalin password dalam satu sentuhan.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500 leading-relaxed">
              Wi-Fi sedang dinonaktifkan. Bagian Wi-Fi tidak akan ditampilkan kepada pelanggan saat memindai stand meja.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
