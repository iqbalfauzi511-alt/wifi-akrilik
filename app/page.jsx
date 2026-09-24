import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Cpu,
  Layers,
  BatteryCharging,
  Battery,
  Droplets,
  Link2,
  PackageCheck,
  Check,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  MapPin,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentSession();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';
  const whatsappBaseUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      <Navbar session={session} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Subtle decorative color shapes matching the brand design */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Stand Akrilik QR &amp; Chip NFC Meja Bisnis</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                Ubah Pengunjung Puas<br className="hidden sm:inline" />{' '}
                Jadi Ulasan <span className="text-[#1A73E8]">Bintang 5</span><br className="hidden sm:inline" />{' '}
                di{' '}
                <span className="inline-flex items-center tracking-normal font-black">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                  <span className="text-slate-900 ml-2">Maps</span>
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Tingkatkan reputasi dan peringkat pencarian lokal bisnis Anda secara instan. Tamu cukup menempelkan smartphone ke chip NFC atau memindai kode QR tanpa perlu download aplikasi.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                <a
                  href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20tertarik%20dengan%20stand%20akrilik%20Cobascan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <button className="w-full sm:w-auto px-7 py-3.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 inline-flex items-center justify-center gap-2.5 text-sm transition-all hover:scale-[1.02]">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Pesan Stand Akrilik</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                </a>
                <Link href="#cara-kerja" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl inline-flex items-center justify-center gap-2.5 text-sm transition-colors shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Play className="w-2.5 h-2.5 fill-blue-600 ml-0.5" />
                    </div>
                    <span>Pelajari Cara Kerja</span>
                  </button>
                </Link>
              </div>

              {/* Social Proof Avatars */}
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden relative shrink-0">
                    <Image src="/images/cafe-latte.jpg" alt="Pengguna" fill className="object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden relative shrink-0">
                    <Image src="/images/beauty-clinic.jpg" alt="Pengguna" fill className="object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden relative shrink-0">
                    <Image src="/images/restaurant-dish.jpg" alt="Pengguna" fill className="object-cover" />
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Dipercaya oleh <strong className="text-slate-900 font-bold">1.000+</strong> bisnis di seluruh Indonesia
                </p>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5 relative mx-auto w-full max-w-[420px] lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white p-3 group">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
                  <Image
                    src="/images/acrylic-stand-hero.jpg"
                    alt="Stand Akrilik Cobascan di Meja Kafe"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    priority
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                  {/* Floating Logo Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center">
                    <div className="w-8 h-8 relative">
                      <Image src="/cobascan-logo.png" alt="Cobascan" fill className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Technical Metrics Floating Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xl shadow-slate-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1 Detik */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900">1 Detik</div>
              <div className="text-xs text-slate-600 leading-snug mt-0.5">
                Kecepatan respon saat HP tamu ditempelkan.
              </div>
            </div>
          </div>

          {/* NTAG213 */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900">NTAG213</div>
              <div className="text-xs text-slate-600 leading-snug mt-0.5">
                Chip NFC pasif yang kompatibel dengan semua iPhone &amp; Android.
              </div>
            </div>
          </div>

          {/* Akrilik 3mm */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900">Akrilik 3mm</div>
              <div className="text-xs text-slate-600 leading-snug mt-0.5">
                Kokoh, tahan tumpahan minuman &amp; tidak menguning karena UV.
              </div>
            </div>
          </div>

          {/* 100% Pasif */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900">100% Pasif</div>
              <div className="text-xs text-slate-600 leading-snug mt-0.5">
                Bebas baterai, tanpa perlu colokan kabel listrik.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-20 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA4335] mb-2 block">
              CARA KERJA
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              3 Langkah Mudah bagi Pengunjung
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
            {/* Step 01 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image src="/images/step-tap-nfc.jpg" alt="Tamu Tap atau Scan" fill className="object-cover" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#1A73E8] text-white font-bold text-xs flex items-center justify-center shadow">
                  01
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Tamu Tap atau Scan</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tamu menempelkan smartphone ke logo NFC atau memindai kode QR menggunakan kamera HP biasa (tanpa instal aplikasi apapun).
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image src="/images/step-google-review.jpg" alt="Halaman Google Maps Terbuka" fill className="object-cover" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#EA4335] text-white font-bold text-xs flex items-center justify-center shadow">
                  02
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Halaman Google Maps Terbuka</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Browser HP langsung menampilkan form resmi ulasan Google Profil Bisnis Anda agar tamu bisa langsung klik bintang 5.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image src="/images/step-wifi-success.jpg" alt="Akses Wi-Fi & Pantau Statistik" fill className="object-cover" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#34A853] text-white font-bold text-xs flex items-center justify-center shadow">
                  03
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Akses Wi-Fi &amp; Pantau Statistik</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Password Wi-Fi tamu otomatis ditampilkan setelah ulasan, dan pemilik toko bisa memantau statistik scan di dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section id="keunggulan" className="py-20 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-2 block">
              KEUNGGULAN
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Dirancang untuk Bisnis Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-5 shadow-sm shadow-emerald-500/20">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Siap Pakai dari Kotak</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tiap stand sudah memiliki kode aktivasi unik. Tinggal buka dashboard, masukkan kode, langsung terhubung.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center mb-5 shadow-sm shadow-red-500/20">
                <Battery className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">100% Tanpa Baterai</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bekerja menggunakan induksi elektromagnetik HP pengunjung. Tidak perlu dicharge seumur hidup.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-blue-500/20">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tahan Air &amp; Noda</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Grafis QR dan chip terlindung di dalam lapisan akrilik padat, aman dari tumpahan kopi/kuah dan mudah dilap.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-5 shadow-sm shadow-amber-500/20">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tautan Fleksibel Dinamis</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jika nama Wi-Fi, password, atau link Google Maps berubah, cukup ubah di dashboard. Akrilik di meja tidak perlu diganti atau dicetak ulang!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skenario Penggunaan Nyata Sektor Bisnis */}
      <section id="solusi" className="py-20 sm:py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-2 block">
              COCOK UNTUK BERBAGAI JENIS USAHA
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Solusi untuk Setiap Bisnis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kafe & Coffee Shop */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <Image src="/images/cafe-latte.jpg" alt="Kafe & Coffee Shop" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Kafe &amp; Coffee Shop</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diletakkan di meja makan &amp; meja kasir (tamu santai ulas rasa/suasana sambil akses Wi-Fi).
                </p>
              </div>
            </div>

            {/* Klinik & Salon Kecantikan */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <Image src="/images/beauty-clinic.jpg" alt="Klinik & Salon Kecantikan" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Klinik &amp; Salon Kecantikan</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diletakkan di meja resepsionis/ruang tunggu (merekam ulasan saat pelanggan puas selesai treatment).
                </p>
              </div>
            </div>

            {/* Restoran & Retail Offline */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <Image src="/images/restaurant-dish.jpg" alt="Restoran & Retail Offline" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Restoran &amp; Retail Offline</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diletakkan di kasir &amp; pintu keluar untuk mendongkrak ranking lokal Google Maps di kota Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 sm:py-28 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-2 block">
              HARGA
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Pilih Paket yang Sesuai untuk Bisnis Anda
            </h2>
            <p className="mt-2 text-slate-600 text-xs sm:text-sm">
              Beli putus, tanpa biaya bulanan. Investasi sekali, manfaat jangka panjang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {/* Paket 1 Stand */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Paket Starter</h3>
                <div className="text-xs text-slate-500 mb-4">1 Stand</div>
                <div className="text-3xl font-black text-slate-900 mb-6">Rp 249.000</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>1 stand akrilik (QR + NFC)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Kode aktivasi unik</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Panduan aktivasi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Cocok untuk meja kasir/uji coba</span>
                  </li>
                </ul>
              </div>
              <a
                href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20memesan%20Paket%20Starter%201%20Stand%20Cobascan`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8"
              >
                <button className="w-full py-3 px-4 rounded-xl border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 font-bold text-sm transition-colors">
                  Pesan Sekarang
                </button>
              </a>
            </div>

            {/* Paket 5 Stand (Best Seller) */}
            <div className="bg-white rounded-2xl border-2 border-[#1A73E8] p-8 flex flex-col justify-between shadow-xl relative scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1A73E8] text-white text-xs font-bold px-4 py-1 rounded-full shadow flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Best Seller</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Paket Meja Kafe</h3>
                <div className="text-xs text-slate-500 mb-4">5 Stand</div>
                <div className="text-3xl font-black text-slate-900 mb-6">Rp 999.000</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>5 stand akrilik (QR + NFC)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Kode aktivasi unik</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Panduan aktivasi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Pas untuk kafe dengan 5 meja utama</span>
                  </li>
                </ul>
              </div>
              <a
                href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20memesan%20Paket%20Meja%20Kafe%205%20Stand%20Cobascan`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8"
              >
                <button className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]">
                  Pesan Sekarang
                </button>
              </a>
            </div>

            {/* Paket 10 Stand */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Paket Multi-Cabang</h3>
                <div className="text-xs text-slate-500 mb-4">10 Stand</div>
                <div className="text-3xl font-black text-slate-900 mb-6">Rp 1.790.000</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>10 stand akrilik (QR + NFC)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Kode aktivasi unik</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Panduan aktivasi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1A73E8] shrink-0" />
                    <span>Untuk restoran besar atau banyak cabang</span>
                  </li>
                </ul>
              </div>
              <a
                href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20memesan%20Paket%2010%20Stand%20Cobascan`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8"
              >
                <button className="w-full py-3 px-4 rounded-xl border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 font-bold text-sm transition-colors">
                  Pesan Sekarang
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-100 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                  Siap Tingkatkan Reputasi Bisnis Anda?
                </h2>
                <p className="text-sm text-slate-600 mb-8 max-w-xl">
                  Pesan sekarang melalui WhatsApp dan dapatkan stand akrilik Cobascan.
                </p>
                <a
                  href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20konsultasi%20pemesanan%20Cobascan`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="px-8 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2.5 text-sm transition-all hover:scale-[1.02]">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Pesan via WhatsApp</span>
                  </button>
                </a>
              </div>

              <div className="lg:col-span-4 flex items-center justify-center relative">
                <div className="relative w-40 h-52">
                  <Image src="/images/acrylic-stand-hero.jpg" alt="Cobascan Stand" fill className="object-contain drop-shadow-xl" />
                  {/* Floating Logo Badge */}
                  <div className="absolute -top-3 -left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center rotate-[-6deg]">
                    <div className="w-6 h-6 relative">
                      <Image src="/cobascan-logo.png" alt="Cobascan" fill className="object-contain" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl px-3.5 py-2 shadow-md text-[11px] font-bold text-slate-800 rotate-[-4deg]">
                  Bisnis Lebih Dikenal! ❤️
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
            {/* Col 1 */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 relative">
                  <Image src="/cobascan-logo.png" alt="Cobascan" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-slate-900 text-xl pt-0.5">Cobascan</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Solusi sederhana untuk pengalaman pelanggan yang lebih baik.
              </p>
            </div>

            {/* Col 2 */}
            <div className="md:col-span-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Menu</div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li><Link href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</Link></li>
                <li><Link href="#keunggulan" className="hover:text-blue-600 transition-colors">Keunggulan</Link></li>
                <li><Link href="#harga" className="hover:text-blue-600 transition-colors">Harga</Link></li>
                <li><Link href="#solusi" className="hover:text-blue-600 transition-colors">Solusi Bisnis</Link></li>
                <li><Link href="/login" className="hover:text-blue-600 transition-colors">Masuk Dashboard</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="md:col-span-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Hubungi Kami</div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+62 812-3456-7890</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>halo@cobascan.id</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-slate-400" />
                  <span>@cobascan</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Indonesia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Cobascan. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Scan, Tap, Connect. <span className="text-red-500">❤️</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
