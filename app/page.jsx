import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Radio,
  Star,
  Wifi,
  Smartphone,
  Store,
  Zap,
  BarChart3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentSession();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar session={session} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-brand-200/50 via-indigo-200/40 to-amber-100/40 blur-[110px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
            </span>
            <span>Platform QR Code untuk Bisnis Anda</span>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Cobascan
            <span className="block mt-2 text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-amber-600">
              Scan. Tap. Connect. Review.
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Satu scan, berbagai akses untuk bisnis Anda. Perangkat QR terintegrasi untuk mengarahkan pelanggan langsung ke Google Review dan fasilitas Wi-Fi.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-lg shadow-brand-600/25">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a
              href="#cara-kerja"
              className="w-full sm:w-auto inline-flex items-center justify-center text-sm font-semibold text-slate-700 hover:text-slate-900 px-6 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              Lihat Cara Kerja
            </a>
          </div>

          {/* Feature Highlights Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80">
              <QrCode className="w-4 h-4 text-brand-600" />
              <span>QR Scan</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>NFC Tap</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-900">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>⭐ Google Review</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-900">
              <Wifi className="w-4 h-4 text-brand-600" />
              <span>📶 Wi-Fi Access</span>
            </div>
          </div>

          {/* Interactive Mock Preview Card of Cobascan Device */}
          <div className="mt-12 max-w-xl mx-auto">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-left relative overflow-hidden">
              {/* Product Badge Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-wide">COBASCAN</h4>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                      <QrCode className="w-3.5 h-3.5 text-brand-400" />
                      <span>QR Code Dinamis</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  SIAP DIGUNAKAN
                </span>
              </div>

              {/* Functional Preview Cards */}
              <div className="space-y-3 mb-4">
                {/* 1. Google Review Function */}
                <div className="bg-gradient-to-r from-amber-500/15 via-slate-800 to-slate-800/90 rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>⭐ Google Review</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">UTAMA</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Arahkan pelanggan langsung ke ulasan bintang 5
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>

                {/* 2. Wi-Fi Access Function */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>📶 Wi-Fi Access</span>
                        <span className="text-[10px] font-medium text-slate-400">Tambahan</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Fasilitas koneksi Wi-Fi aman untuk pengunjung kafe/toko
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">SSID: KAFE-TAMU</span>
                </div>
              </div>

              {/* Device Micro Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                  Kamera Scan Smartphone
                </span>
                <span className="text-brand-400 font-mono font-bold">domain.com/q/CS-X7K29A</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              Satu Perangkat, Akses Mudah
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Cara Kerja Cobascan
            </h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Hanya butuh beberapa detik bagi pelanggan untuk terhubung ke Google Review dan Wi-Fi bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Pasang Perangkat',
                desc: 'Letakkan perangkat QR Cobascan di setiap meja atau kasir bisnis Anda.',
                icon: Store,
              },
              {
                step: '02',
                title: 'Scan QR Code',
                desc: 'Pelanggan cukup scan QR dengan kamera HP.',
                icon: Smartphone,
              },
              {
                step: '03',
                title: 'Buka Google Review',
                desc: 'Sistem langsung membuka halaman Google Review resmi untuk memberikan rating & ulasan.',
                icon: Star,
              },
              {
                step: '04',
                title: 'Akses Wi-Fi (Opsional)',
                desc: 'Jika Wi-Fi diaktifkan, pelanggan langsung mendapatkan password koneksi internet.',
                icon: Wifi,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative flex flex-col hover:border-brand-300 transition-colors"
              >
                <div className="text-2xl font-black text-brand-200 mb-3 font-mono">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kelebihan Cobascan Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              Keunggulan
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kenapa Bisnis Memilih Cobascan?
            </h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Solusi all-in-one cerdas yang menyatukan perangkat fisik, cloud dashboard, dan pengalaman digital pengunjung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Akses Sekali Scan',
                desc: 'Pelanggan bebas scan QR menggunakan kamera untuk membuka halaman tanpa repot instal aplikasi.',
                icon: QrCode,
              },
              {
                title: 'Tingkatkan Google Review Bintang 5',
                desc: 'Fungsi utama Cobascan dirancang untuk mempermudah pelanggan memberikan penilaian positif sehingga reputasi toko atau kafe Anda melejit di Google Maps.',
                icon: Star,
              },
              {
                title: 'Pengaturan Dinamis di Cloud',
                desc: 'Ganti link review atau perbarui password Wi-Fi kapan saja dari dashboard. Seluruh perangkat fisik QR di meja otomatis menyajikan data terbaru tanpa perlu cetak ulang.',
                icon: RefreshCw,
              },
              {
                title: 'Fasilitas Akses Wi-Fi Fleksibel',
                desc: 'Aktifkan opsi Wi-Fi untuk memberikan pengalaman lengkap bagi tamu, atau matikan untuk fokus 100% langsung mengarahkan pengunjung ke halaman ulasan Google.',
                icon: Wifi,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600 shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{feature.title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Siap Menghubungkan Bisnis Anda dengan Cobascan?
            </h3>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Dapatkan perangkat fisik Cobascan dan mulai kumpulkan ulasan Google Maps serta kelola akses Wi-Fi bisnis Anda sekarang.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30">
                  Mulai dengan Cobascan
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Cobascan</span>
            <span>&bull; Scan. Tap. Connect. Review.</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/login" className="hover:text-slate-900">
              Customer Login
            </Link>
            <Link href="/admin" className="hover:text-slate-900">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
