import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Star,
  Monitor,
  CheckCircle2,
  Battery,
  Droplets,
  Link as LinkIcon,
  HelpCircle,
  QrCode,
  MapPin,
  Wifi,
  Store,
  Coffee,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentSession();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';
  const whatsappBaseUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      <Navbar session={session} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Stand Akrilik QR &amp; Chip NFC Meja Bisnis</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-black text-slate-900 tracking-tight leading-[1.18] mb-6">
                Ubah Pengunjung Puas Jadi <span className="text-[#1A73E8]">Ulasan Bintang 5</span> di Google Maps
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Tingkatkan reputasi dan peringkat pencarian lokal bisnis Anda secara instan. Tamu cukup menempelkan smartphone ke chip NFC atau memindai kode QR tanpa perlu download aplikasi.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <a
                  href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20tertarik%20dengan%20stand%20akrilik%20Cobascan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto px-8 !bg-[#1A73E8] hover:!bg-[#1557B0] text-white shadow-md shadow-blue-500/20 font-bold">
                    Pesan Stand Akrilik
                  </Button>
                </a>
                <Link href="#cara-kerja" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 font-semibold border-slate-300 hover:bg-slate-50">
                    Pelajari Cara Kerja
                  </Button>
                </Link>
              </div>

              {/* 4 Technical Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200">
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="text-xl font-black text-slate-900">1 Detik</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Kecepatan Respon</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="text-xl font-black text-slate-900">NTAG213</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Standar Chip NFC</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="text-xl font-black text-slate-900">Akrilik 3mm</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Tahan Percikan &amp; UV</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="text-xl font-black text-slate-900">100% Pasif</div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Bebas Baterai / Kabel</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5 relative mx-auto w-full max-w-[460px] lg:max-w-none">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xl shadow-slate-200/50">
                {/* Photo Container with explicit aspect-square and constrained max width */}
                <div className="relative w-full aspect-square max-w-[420px] mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60">
                  <Image 
                    src="/stand.jpg" 
                    alt="Stand Akrilik Cobascan" 
                    fill 
                    className="object-cover" 
                    priority 
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
                
                {/* Floating Information Strip */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Portal Ulasan &amp; Akses Wi-Fi</div>
                    <div className="text-xs text-slate-600">Satu perangkat fisik untuk reputasi Google dan koneksi tamu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 block">
              Alur Penggunaan Praktis
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              3 Langkah Mudah bagi Pengunjung
            </h2>
            <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto">
              Proses cepat tanpa repot agar pelanggan senang memberikan rating bintang 5 di lokasi bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-mono font-black text-lg flex items-center justify-center mb-6 border border-blue-100">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Tamu Tap atau Scan</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Smartphone Android atau iPhone cukup ditempelkan ke logo NFC pada akrilik, atau dipindai dengan kamera smartphone biasa ke QR code.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanpa instalasi aplikasi</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 font-mono font-black text-lg flex items-center justify-center mb-6 border border-amber-100">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Halaman Google Maps Terbuka</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Layar smartphone langsung menampilkan formulir ulasan resmi Google Profil Bisnis Anda. Pelanggan dapat langsung memberikan bintang 5.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 w-fit px-3 py-1.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Pengumpulan ulasan instan</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-black text-lg flex items-center justify-center mb-6 border border-emerald-100">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Akses Wi-Fi &amp; Pantau Statistik</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Password Wi-Fi tamu otomatis terbuka setelah ulasan. Pemilik bisnis dapat memantau performa interaksi setiap unit stand melalui dashboard.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 w-fit px-3 py-1.5 rounded-full border border-blue-200">
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                <span>Dashboard analitik pemilik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spesifikasi Hardware Section */}
      <section id="spesifikasi" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 block">
              Kualitas Material
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Spesifikasi Fisik Stand Akrilik
            </h2>
            <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto">
              Material akrilik solid dan komponen chip pasif yang siap digunakan di meja kasir, ruang tunggu, atau meja pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Siap Pakai dari Kotak</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Setiap unit stand akrilik sudah memiliki kode aktivasi siap pakai. Tinggal login ke dashboard dan sambungkan ke link Google Maps bisnis Anda.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Battery className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">100% Bebas Baterai</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Memanfaatkan induksi frekuensi radio dari smartphone pengunjung, perangkat tidak membutuhkan pengisian daya, kabel listrik, atau baterai.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tahan Air &amp; Sinar UV</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Grafis QR code dan chip NFC terlindungi di dalam lapisan akrilik bening berkualitas tinggi, tahan tumpahan minuman serta tidak menguning.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tautan Fleksibel Dinamis</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jika link Google Maps atau password Wi-Fi Anda berubah di kemudian hari, cukup perbarui dari dashboard tanpa perlu mencetak ulang fisik akrilik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skenario Penggunaan Nyata Sektor Bisnis */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Penerapan Strategis
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Skenario Penggunaan Berbagai Sektor Usaha
            </h2>
            <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto">
              Tempatkan stand akrilik pintar di titik kontak strategis tempat pelanggan Anda berinteraksi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 border border-amber-100">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Kafe &amp; Coffee Shop</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Diletakkan di setiap meja makan atau area kasir. Tamu yang sedang santai dapat langsung terhubung ke Wi-Fi sekaligus memberikan ulasan positif tentang suasana dan rasa menu.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
                Titik Peletakan: Meja pelanggan &amp; meja kasir
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Klinik &amp; Salon Kecantikan</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Ditempatkan di meja resepsionis atau ruang tunggu. Mengoptimalkan momentum kepuasan pelanggan tepat setelah menerima pelayanan prima sebelum mereka meninggalkan klinik.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
                Titik Peletakan: Meja resepsionis &amp; ruang tunggu
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 border border-blue-100">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Restoran &amp; Retail Offline</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Mempermudah pembeli baru menemukan lokasi dan meninggalkan ulasan positif, sehingga toko Anda menonjol pada hasil pencarian lokal Google Maps di kota Anda.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
                Titik Peletakan: Area kasir &amp; pintu keluar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 block">
              Investasi Hardware
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Pilihan Paket Hardware Cobascan
            </h2>
            <p className="mt-3 text-slate-600 text-sm max-w-xl mx-auto">
              Satu kali bayar untuk kepemilikan unit fisik akrilik, gratis akses dashboard manajemen selamanya tanpa biaya langganan bulanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Paket 1 Stand */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">STARTER</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">1 Stand Akrilik</h3>
              <p className="text-sm text-slate-600 mb-6">Pilihan pas untuk uji coba di meja kasir atau meja utama bisnis Anda.</p>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-slate-900">Rp 249.000</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mb-8">
                Satu kali bayar untuk hardware fisik
              </div>

              <div className="space-y-4 mb-8 text-sm text-slate-700 flex-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>1x Stand Akrilik QR &amp; Chip NFC Terintegrasi</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Dashboard pemantauan scan &amp; pengelolaan Wi-Fi</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Dukungan ganti URL tautan Google Maps kapan saja</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Garansi hardware fisik 1 tahun</span>
                </div>
              </div>

              <a href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20memesan%20Paket%201%20Stand%20Cobascan`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full font-bold">
                  Pesan Paket 1 Stand
                </Button>
              </a>
            </div>

            {/* Paket 3 Stand */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 flex flex-col shadow-md relative">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">BISNIS BERKEMBANG</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">3 Stand Akrilik</h3>
              <p className="text-sm text-slate-600 mb-6">Ideal untuk menjangkau beberapa meja tunggu atau area kasir dan lantai dua.</p>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-slate-900">Rp 599.000</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mb-8">
                Satu kali bayar (~Rp 199.000 / unit)
              </div>

              <div className="space-y-4 mb-8 text-sm text-slate-700 flex-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>3x Stand Akrilik QR &amp; Chip NFC Terintegrasi</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Analitik scan individual per meja atau perangkat</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Fleksibilitas tautan ulasan per meja atau seragam</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Garansi hardware fisik 1 tahun</span>
                </div>
              </div>

              <a href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20memesan%20Paket%203%20Stand%20Cobascan`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full !bg-blue-600 hover:!bg-blue-700 text-white font-bold">
                  Pesan Paket 3 Stand
                </Button>
              </a>
            </div>

            {/* Paket 10 Stand */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">MULTI-CABANG / RESTO BESAR</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">10 Stand Akrilik</h3>
              <p className="text-sm text-slate-600 mb-6">Solusi lengkap untuk restoran skala besar atau kebutuhan multi-cabang usaha.</p>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-slate-900">Rp 1.799.000</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mb-8">
                Satu kali bayar (~Rp 179.000 / unit)
              </div>

              <div className="space-y-4 mb-8 text-sm text-slate-700 flex-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>10x Stand Akrilik QR &amp; Chip NFC Terintegrasi</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Manajemen multi-cabang terpusat di satu akun</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Dukungan konfigurasi awal batch sebelum pengiriman</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
                  <span>Garansi hardware fisik 1 tahun</span>
                </div>
              </div>

              <a href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20memesan%20Paket%2010%20Stand%20Cobascan`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full font-bold">
                  Pesan Paket 10 Stand
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pertanyaan Seputar Perangkat Cobascan
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">
                Apakah perangkat ini membutuhkan biaya langganan bulanan?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tidak. Pembelian bersifat satu kali untuk unit hardware fisik akrilik. Pengelolaan tautan dan dashboard analitik dapat Anda gunakan tanpa biaya langganan.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">
                Bagaimana jika tautan Google Maps atau nama Wi-Fi berubah di kemudian hari?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Anda tidak perlu mengganti unit fisik. Cukup masuk ke dashboard akun Anda, lalu perbarui URL tujuan atau kredensial Wi-Fi. Scan dan tap pengunjung akan langsung diarahkan ke data yang baru.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">
                Apakah chip NFC di dalam stand membutuhkan baterai atau pengisian daya?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tidak memerlukan baterai sama sekali. Chip NFC bekerja secara pasif dengan memanfaatkan induksi elektromagnetik dari smartphone pengunjung saat didekatkan.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base">
                Bagaimana jika smartphone pengunjung belum memiliki fitur NFC?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Pengunjung tetap dapat memindai kode QR dinamis beresolusi tinggi yang tercetak pada permukaan stand menggunakan aplikasi kamera standar smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-10 sm:p-14 text-center text-white shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Siap Memaksimalkan Ulasan Google Bisnis Anda?
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Mulai kumpulkan reputasi positif dari pelanggan yang berkunjung langsung ke outlet Anda melalui stand akrilik Cobascan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={`${whatsappBaseUrl}?text=Halo%2C%20saya%20ingin%20konsultasi%20pemesanan%20Cobascan`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full !bg-white !text-slate-900 hover:!bg-slate-100 px-8 font-bold">
                  Pesan via WhatsApp
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full !bg-transparent border border-slate-600 text-white hover:!bg-slate-800 px-8 font-semibold">
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
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 flex items-center justify-center relative mix-blend-multiply">
                <Image src="/logo.png" alt="Cobascan" width={100} height={100} className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-800 text-lg">Cobascan</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs text-center md:text-left">
              Stand akrilik pintar berbasis chip NFC dan kode QR dinamis untuk ulasan Google Maps dan akses Wi-Fi bisnis.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600">
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#spesifikasi" className="hover:text-blue-600 transition-colors">Keunggulan</a>
            <a href="#harga" className="hover:text-blue-600 transition-colors">Harga</a>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Masuk Dashboard</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Cobascan. Hak cipta dilindungi.</p>
          <p className="mt-2 sm:mt-0">Dirancang untuk kebutuhan UMKM dan bisnis retail di Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
