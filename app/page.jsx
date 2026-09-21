import React from 'react';
import Link from 'next/link';
import {
  Wifi,
  Instagram,
  QrCode,
  ShieldCheck,
  Zap,
  BarChart3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-200/40 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Kombinasi Fisik Akrilik QR & Web SaaS Otomatis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Wi-Fi Gratis.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
              Followers Bertambah.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Satu QR Code untuk menghubungkan pengunjung dengan Wi-Fi dan Instagram bisnis Anda.
            Tingkatkan engagement kafe Anda tanpa ribet.
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

          {/* Interactive Mock Preview Card */}
          <div className="mt-14 max-w-xl mx-auto">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">KOPI SENJA</h4>
                    <p className="text-[11px] text-slate-400">Wi-Fi Khusus Pelanggan</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-4">
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Follow Instagram kami untuk mendapatkan password Wi-Fi:
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-semibold">
                  <Instagram className="w-3.5 h-3.5" />
                  @kopisenja
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>🔐 Password aman & tersembunyi hingga di-follow</span>
                <span className="text-brand-400 font-mono">SW-X7K29A</span>
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
              Sederhana & Cepat
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Cara Kerja Smart Wi-Fi
            </h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Hanya butuh 4 langkah mudah dari akrilik di meja hingga pelanggan terhubung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Pasang QR',
                desc: 'Letakkan akrilik Smart Wi-Fi QR di setiap meja atau meja kasir kafe Anda.',
                icon: QrCode,
              },
              {
                step: '02',
                title: 'Pengunjung Scan',
                desc: 'Pelanggan membuka kamera smartphone dan scan kode unik akrilik.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Follow Instagram',
                desc: 'Klik satu tombol untuk diarahkan langsung ke profil Instagram kafe Anda.',
                icon: Instagram,
              },
              {
                step: '04',
                title: 'Dapat Password Wi-Fi',
                desc: 'Klik "Saya Sudah Follow" dan password Wi-Fi langsung terbuka untuk disalin.',
                icon: Wifi,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative flex flex-col"
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

      {/* Kenapa Smart Wi-Fi Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              Kelebihan
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kenapa Memilih Smart Wi-Fi?
            </h3>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Dirancang khusus untuk memecahkan kerepotan operasional kafe sehari-hari.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Tidak Perlu Ganti QR Saat Password Berubah',
                desc: 'Cukup ubah password di dashboard, seluruh akrilik di meja otomatis menyajikan password baru tanpa perlu cetak ulang.',
                icon: RefreshCw,
              },
              {
                title: 'Aktivasi Mandiri Dalam Hitungan Detik',
                desc: 'Customer cukup scan QR akrilik baru, login Google, dan isi data bisnis. QR langsung aktif seketika.',
                icon: Zap,
              },
              {
                title: 'Dashboard Sederhana & Ramah Pemula',
                desc: 'Kelola informasi Instagram, nama SSID Wi-Fi, dan password kapan saja dari smartphone maupun laptop.',
                icon: ShieldCheck,
              },
              {
                title: 'Pantau Jumlah Scan Secara Real-Time',
                desc: 'Ketahui berapa banyak pengunjung yang scan QR dan mengakses Wi-Fi setiap harinya.',
                icon: BarChart3,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{feature.title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Siap Menambah Followers Instagram Kafe Anda?
            </h3>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto text-sm sm:text-base">
              Dapatkan produk akrilik Smart Wi-Fi QR dan mulai hubungkan pelanggan dengan bisnis Anda sekarang.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button variant="secondary" size="lg" className="bg-white text-brand-900 hover:bg-brand-50 shadow-md">
                  Dapatkan Smart Wi-Fi
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
              W
            </div>
            <span className="font-semibold text-slate-700">Smart Wi-Fi QR</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
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
