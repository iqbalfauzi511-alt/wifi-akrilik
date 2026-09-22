import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Star,
  Monitor,
  CheckCircle2,
  Battery,
  Droplets,
  Link as LinkIcon,
  HelpCircle,
  QrCode
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-brand-500 selection:text-white">
      <Navbar session={session} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 tracking-wide shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            PERANGKAT PINTAR UNTUK GOOGLE REVIEW
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
            Ubah Pengunjung Puas Jadi Ulasan Bintang 5 di Google Secara Instan
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sistem cerdas dengan chip NFC dan QR code berdaya tahan tinggi. Cukup tempelkan HP atau scan tanpa perlu download aplikasi apapun.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20produk%20Cobascan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 border-brand-600 px-8">
                Pesan Sekarang
              </Button>
            </a>
          </div>

          {/* Features Bar */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 max-w-4xl mx-auto border-t border-slate-100 pt-10">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-900">Tanpa Batas</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Kuota Scan & Tap</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-900">1 Detik</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Kecepatan Akses</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-900">Gratis</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Biaya Langganan</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Tanpa Baterai</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-20 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
              Langkah Mudah
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Cara Kerja 3 Langkah Mudah
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Didesain praktis agar tamu Anda dapat memberikan rating bintang lima tanpa kesulitan teknis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono font-bold flex items-center justify-center mb-6">
                01
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Tamu Tap atau Scan</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                HP iPhone maupun Android cukup didekatkan ke permukaan perangkat, atau cahaya aktifkan kamera ke QR code.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tanpa instal aplikasi apapun
              </div>
            </div>
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono font-bold flex items-center justify-center mb-6">
                02
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Terbuka Halaman Ulasan</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Perangkat otomatis membuka formulir review resmi Google Profil Bisnis Anda dalam hitungan detik. Tanpa filter, langsung ke sasaran.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-3 py-1.5 rounded-full border border-amber-100">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> Kumpulkan bintang 5
              </div>
            </div>
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono font-bold flex items-center justify-center mb-6">
                03
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Pantau di Dashboard</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Ketahui performa dan jumlah interaksi per meja, kasir, atau cabang secara *realtime* melalui dasbor analitik pemilik usaha.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 w-fit px-3 py-1.5 rounded-full border border-brand-100">
                <Monitor className="w-3.5 h-3.5" /> Analitik Real-Time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spesifikasi & Keunggulan Section */}
      <section id="spesifikasi" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
              Keunggulan Fisik
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Spesifikasi & Keunggulan Perangkat
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Didesain khusus untuk tahan lama di area publik. Dirancang kuat dan estetis untuk meja bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-brand-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Aktivitas Scan Tidak Dibatasi</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                QR bisa discan dengan cepat. Tidak dibatasi algoritma karena murni hardware. Tanpa biaya langganan bulanan scan/tap tambahan.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Battery className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">100% Tanpa Baterai</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bekerja menggunakan induksi magnetik *smartphone*, perangkat ini tidak perlu di-charge, dicolok kabel, atau ganti baterai.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Monitor className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Tampilkan Sandi Wi-Fi</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tamu tidak perlu lagi repot bertanya ke kasir. Cukup scan, sistem akan langsung menampilkan dan menyambungkan WiFi ke HP pelanggan.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Droplets className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Cetak Anti Pudar & Tahan Air</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Dicetak dengan bahan premium berdaya tahan tinggi agar aman dari paparan sinar UV matahari langsung atau cipratan air.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Ganti Link Kapan Saja</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bisa bawa *device* ke lokasi/cabang baru. *Smart link* dapat Anda perbarui langsung dari *dashboard* kapanpun dan di mana saja.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xl hover:shadow-rose-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Dashboard Analitik Terpusat</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Setiap pemindaian yang berhasil tercatat di sistem kami. Anda bisa memantau performa perangkat secara realtime dari laptop/HP Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Penerapan Section */}
      <section id="penerapan" className="py-20 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">
              Fleksibilitas
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Sangat Cocok Diterapkan di Berbagai Bisnis
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Perangkat dirancang khusus untuk membaur dan meningkatkan estetika di meja kasir, ruang tunggu, maupun meja pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-40 bg-brand-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-indigo-600 opacity-90"></div>
                <h4 className="text-2xl font-black text-white relative z-10 drop-shadow-sm">F&B / Kuliner</h4>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 mb-3">Kafe & Restoran</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Letakkan di setiap meja agar pelanggan bisa dengan mudah menghubungkan ponsel ke WiFi kafe Anda sekaligus memberikan review sambil menunggu pesanan datang.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-40 bg-emerald-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 opacity-90"></div>
                <h4 className="text-2xl font-black text-white relative z-10 drop-shadow-sm">Kesehatan</h4>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 mb-3">Klinik & Apotek</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Sangat tepat diletakkan di ruang tunggu pasien. Pasien yang merasa puas dengan layanan dokter/staf dapat langsung memberikan ulasan positif dalam hitungan detik.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-40 bg-amber-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 opacity-90"></div>
                <h4 className="text-2xl font-black text-white relative z-10 drop-shadow-sm">Retail & Jasa</h4>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 mb-3">Toko & Salon</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tempatkan di meja kasir. Saat pelanggan membayar atau menunggu giliran salon, ajak mereka memindai alat ini untuk mendongkrak visibilitas bisnis lokal Anda di pencarian peta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
              Paket Harga Transparan
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Satu Harga, Akses Selamanya
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
              Sistem perangkat fisik canggih yang dilengkapi dashboard pintar.
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-brand-500 p-8 shadow-xl relative overflow-hidden text-center">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-500"></div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-6">
              TERLARIS & TERJANGKAU
            </div>
            
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Smart Perangkat QR & NFC</h4>
            <div className="text-sm text-slate-500 mb-6">Cocok untuk UMKM, Kafe, dan Bisnis Ritel</div>
            
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-2xl font-bold text-slate-900">Rp</span>
              <span className="text-5xl font-black text-slate-900 tracking-tight">89.000</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mb-8">
              Satu kali bayar. Tidak ada biaya langganan bulanan.
            </div>

            <div className="space-y-4 mb-8 text-sm text-slate-600 text-left w-max mx-auto">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Bebas ubah link Google Maps kapan saja
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Akses penuh ke Analytics Dashboard
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Fitur Pembuka Password Wi-Fi Otomatis
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Tahan air & tahan lama di meja publik
              </div>
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20produk%20Cobascan%20seharga%2089rb"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button size="lg" className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-md">
                Pesan Sekarang
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Tanya Jawab
            </h2>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Apakah alat ini butuh langganan bulanan?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Tidak sama sekali. Hanya sekali bayar di awal untuk pembelian perangkat fisik. Platform dan dashboard pintar bisa Anda gunakan seterusnya secara gratis.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Bagaimana jika alamat atau link Google Maps bisnis saya pindah?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Anda tidak perlu membeli perangkat baru. Cukup log in ke dashboard, perbarui tautan profil Google Maps Anda, dan sistem akan langsung memperbaruinya secara instan ke fisik perangkat Anda.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Apakah baterainya perlu diganti?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Teknologi pintar dalam perangkat ini tidak memerlukan baterai, dan bebas perawatan listrik. Chip NFC menggunakan daya induksi dari smartphone pelanggan.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Apakah ini khusus HP canggih saja?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Sama sekali tidak. Jika HP pelanggan belum memiliki sensor NFC, mereka masih dapat menggunakan kamera standar untuk memindai kode QR dinamis yang tercetak di perangkat dengan kecepatan kilat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-600 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 relative z-10">
              Siap Meningkatkan Reputasi Bisnis Anda di Google?
            </h2>
            <p className="text-brand-100 mb-8 max-w-xl mx-auto text-sm sm:text-base relative z-10">
              Mulai kumpulkan ulasan positif pelanggan lama Anda dengan mudah hari ini dengan alat cerdas ini.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-50 border-white px-8">
                  Pesan via WhatsApp
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" className="!bg-transparent border border-brand-400 text-white hover:!bg-brand-500 px-8 shadow-none">
                  Masuk Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-lg">Cobascan</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs text-center md:text-left">
              Platform perangkat keras & lunak cerdas untuk meningkatkan ulasan bintang 5 Google Maps bisnis Anda.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 sm:gap-6 text-sm font-medium text-slate-500">
            <a href="#cara-kerja" className="hover:text-brand-600 transition-colors">Cara Kerja</a>
            <a href="#spesifikasi" className="hover:text-brand-600 transition-colors">Keunggulan</a>
            <a href="#harga" className="hover:text-brand-600 transition-colors">Harga</a>
            <Link href="/login" className="hover:text-brand-600 transition-colors">Masuk Dashboard</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Cobascan Technologies. Hak Cipta Dilindungi.</p>
          <p className="mt-2 sm:mt-0">Didesain eksklusif untuk kemajuan UMKM & Bisnis Retail.</p>
        </div>
      </footer>
    </div>
  );
}
