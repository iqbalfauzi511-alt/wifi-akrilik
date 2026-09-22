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
  PlayCircle,
  Wifi
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-brand-500 selection:text-white overflow-x-hidden">
      <Navbar session={session} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="aurora-bg-container">
          <div className="aurora-blob-1"></div>
          <div className="aurora-blob-2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] sm:text-xs font-bold mb-6 tracking-wide shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Perangkat Cerdas Untuk Google Review
              </div>

              {/* Headline */}
              <h1 className="heading-premium text-4xl sm:text-5xl lg:text-[54px] leading-[1.15] mb-6">
                Ubah Pengunjung Puas Jadi <span className="text-gradient-google">Ulasan Bintang 5</span> di Google Secara Instan
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Sistem cerdas dengan chip NFC dan QR code berdaya tahan tinggi. Cukup tempelkan HP atau scan tanpa perlu download aplikasi apapun.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20produk%20Cobascan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full btn-glow-blue px-8">
                    Pesan Sekarang
                  </Button>
                </a>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 gap-2">
                  <PlayCircle className="w-5 h-5 text-slate-400" />
                  Lihat Video (1 Menit)
                </Button>
              </div>

              {/* Features Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-slate-100/60">
                <div>
                  <div className="flex items-center gap-1 mb-1 justify-center lg:justify-start">
                    <span className="text-xl font-black text-slate-900">4.9</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Kepuasan Pelanggan</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">1 Detik</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Kecepatan Tap / Scan</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">3,000+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Bisnis Lokal di Indonesia</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 mb-1">100%</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Tanpa Baterai / Listrik</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="bento-card p-2 sm:p-4 rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
                  <Image src="/stand.jpg" alt="Cobascan Acrylic Stand" fill className="object-cover" priority />
                </div>
                
                {/* Floating Badge overlay */}
                <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-8 bento-card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-2xl animate-bounce-slow">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Visitor Wi-Fi Tersedia</div>
                    <div className="text-[10px] sm:text-xs text-slate-500">Koneksi Instan, Tanpa Tanya Password</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-20 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
              Alur Penggunaan
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
            <div className="bento-card p-8 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono font-bold flex items-center justify-center mb-6">
                01
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Tamu Tap atau Scan</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                HP iPhone maupun Android cukup didekatkan ke permukaan akrilik, atau cahaya aktifkan kamera ke QR code produk di bagian tengah.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] bg-[#F0FDF4] w-fit px-3 py-1.5 rounded-full border border-[#BBF7D0]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tanpa instal aplikasi apapun
              </div>
            </div>
            {/* Step 2 */}
            <div className="bento-card p-8 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono font-bold flex items-center justify-center mb-6">
                02
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Langsung Terbuka Halaman Ulasan</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Perangkat otomatis membuka formulir review resmi Google Profil Bisnis Anda dalam hitungan detik. Tanpa filter, langsung ke sasaran.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-3 py-1.5 rounded-full border border-amber-100">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> Kumpulkan bintang 5
              </div>
            </div>
            {/* Step 3 */}
            <div className="bento-card p-8 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-mono font-bold flex items-center justify-center mb-6">
                03
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Pantau di Dashboard</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Ketahui performa dan jumlah interaksi per meja, kasir, atau cabang secara realtime melalui dasbor analitik pemilik usaha.
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
              Kualitas Industri
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Spesifikasi & Keunggulan Fisik Stand
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Didesain khusus untuk tahan lama di area publik. Dirancang kuat dan estetis untuk meja bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bento-card p-8">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Aktif & Siap Pakai Kirim</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Dikirim dalam keadaan sudah disetup. Stand akrilik bisa langsung dipakai saat diterima, tanpa ribet setting manual atau download tool tambahan.
              </p>
            </div>
            
            <div className="bento-card p-8">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] text-[#15803D] flex items-center justify-center mb-5">
                <Battery className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">100% Tanpa Baterai</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bekerja menggunakan induksi magnetik dari *smartphone*, perangkat ini tidak perlu di-charge, dicolok kabel, atau ganti baterai.
              </p>
            </div>

            <div className="bento-card p-8">
              <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#B45309] flex items-center justify-center mb-5">
                <Droplets className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Cetak Anti Pudar</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Cetakan grafis berkualitas tinggi di dalam akrilik, tahan paparan sinar matahari langsung dan tidak luntur walaupun ketumpahan air.
              </p>
            </div>

            <div className="bento-card p-8">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center mb-5">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Ganti Link Kapan Saja</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bisa bawa *device* ke lokasi/cabang baru. Pembaruan tautan tujuan langsung diterapkan dari sistem *dashboard* kapanpun dan tanpa ribet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ulasan Section (NEW) */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#15803D] mb-3">
              Pengalaman Klien Kami
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Ulasan dari Pemilik Usaha di Indonesia
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Lihat bagaimana Cobascan membantu bisnis lokal meningkatkan visibilitas di Google Maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bento-card p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-8 italic">
                  &quot;Sistem otomatis dari alat ini sangat membantu kafe saya. Pengunjung suka karena tinggal tempel HP langsung keluar rating di Google Maps. Jumlah review bulanan naik lebih dari 3x lipat!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                  BP
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Budi Pratama</div>
                  <div className="text-xs text-slate-500">Pemilik Coffee Shop, Jakarta</div>
                </div>
              </div>
            </div>

            <div className="bento-card p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-8 italic">
                  &quot;Bentuk akriliknya sangat bersih dan elegan, cocok dengan interior klinik kecantikan kami. Pasien yang puas sehabis perawatan sangat terdorong merekomendasikan layanan kami ke pelanggan lain.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                  SK
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Dr. Sarah Kusuma</div>
                  <div className="text-xs text-slate-500">Klinik Kecantikan, Surabaya</div>
                </div>
              </div>
            </div>

            <div className="bento-card p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-8 italic">
                  &quot;Awalnya saya kira bakalan ribet aplikasinya, ternyata pelanggan gak butuh instalasi. Begitu datang, cukup tap NFC dan form review kebuka. Sangat efisien, ROI-nya luar biasa.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                  FR
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Fikri Ridwan</div>
                  <div className="text-xs text-slate-500">Pemilik Rumah Makan, Bandung</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
              Kapasitas Skala Usaha
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Pilihan Paket Harga Transparan
            </h3>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Beli unit sekali, akses dasbor gratis selamanya. Dilengkapi garansi fisik hardware 1 tahun penuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paket 1 Stand */}
            <div className="bento-card p-8 flex flex-col bg-white">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">STARTER</div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">1 Stand Akrilik</h4>
              <p className="text-sm text-slate-500 mb-8">Pilihan pas untuk dicoba di kasir atau meja utama bisnis Anda.</p>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-slate-900">Rp 249.000</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-8">
                Satu kali bayar.
              </div>

              <div className="space-y-4 mb-8 text-sm text-slate-600 flex-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Dashboard Analitik Tap & Scan Perangkat</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Ganti URL kapanpun dari Google Maps/Sosmed Anda</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Gratis dashboard & link selamanya</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Garansi fisik 1 tahun</span>
                </div>
              </div>

              <a href="https://wa.me/6281234567890?text=Halo%20saya%20pesan%20Paket%201%20Stand" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                  Pesan Paket Starter
                </Button>
              </a>
            </div>

            {/* Paket 3 Stand (Populer) */}
            <div className="bento-card p-8 flex flex-col bg-white border-2 border-brand-500 relative shadow-xl transform md:-translate-y-4">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-500"></div>
              <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                <span className="bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Paling Populer / Hemat
                </span>
              </div>
              
              <div className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2 mt-4">BISNIS BERKEMBANG</div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">3 Stand Akrilik</h4>
              <p className="text-sm text-slate-500 mb-8">Ideal untuk menjangkau beberapa area strategis, atau 3 meja tunggu.</p>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-slate-900">Rp 599.000</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-8">
                Satu kali bayar (Rp 199.000 / stand)
              </div>

              <div className="space-y-4 mb-8 text-sm text-slate-600 flex-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>3x Akrilik Premium & Chip NFC Cerdas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Analitik Individual dari Setiap Stand Akrilik</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Arahkan ke Link Google Berbeda (opsional)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Bebas ongkos kirim seluruh Jawa</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Garansi fisik 1 tahun</span>
                </div>
              </div>

              <a href="https://wa.me/6281234567890?text=Halo%20saya%20pesan%20Paket%203%20Stand" target="_blank" rel="noopener noreferrer">
                <Button className="w-full btn-glow-blue">
                  Pesan Paket 3 Stand
                </Button>
              </a>
            </div>

            {/* Paket 10 Stand */}
            <div className="bento-card p-8 flex flex-col bg-white">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">MULTI-CABANG / WARALABA</div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">10 Stand Akrilik</h4>
              <p className="text-sm text-slate-500 mb-8">Solusi lengkap untuk restoran berskala besar, atau cabang franchise.</p>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-slate-900">Rp 1.799.000</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-8">
                Satu kali bayar (± Rp 179.000/stand)
              </div>

              <div className="space-y-4 mb-8 text-sm text-slate-600 flex-1">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Skalabilitas terbaik dari Sistem Review</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Dedicated fast support & prioritas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Manajemen multi-lokasi di 1 dashboard cabang</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
                  <span>Gratis ongkos kirim seluruh Indonesia</span>
                </div>
              </div>

              <a href="https://wa.me/6281234567890?text=Halo%20saya%20pesan%20Paket%2010%20Stand" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                  Pesan Paket 10 Stand
                </Button>
              </a>
            </div>
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
            <div className="bento-card p-6">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Apakah alat ini butuh langganan bulanan?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Tidak sama sekali. Hanya sekali bayar di awal untuk pembelian perangkat fisik. Platform dan dashboard pintar bisa Anda gunakan seterusnya secara gratis.
              </p>
            </div>
            
            <div className="bento-card p-6">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Bagaimana jika alamat atau link Google Maps bisnis saya pindah?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Anda tidak perlu membeli perangkat baru. Cukup log in ke dashboard, perbarui tautan profil Google Maps Anda, dan sistem akan langsung memperbaruinya secara instan ke fisik perangkat Anda.
              </p>
            </div>

            <div className="bento-card p-6">
              <h4 className="font-bold text-slate-900 flex items-center justify-between">
                Apakah baterainya perlu diganti?
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Teknologi pintar dalam perangkat ini tidak memerlukan baterai, dan bebas perawatan listrik. Chip NFC menggunakan daya induksi dari smartphone pelanggan.
              </p>
            </div>
            
            <div className="bento-card p-6">
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
          <div className="bento-card p-10 sm:p-14 text-center relative overflow-hidden bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="heading-premium text-2xl sm:text-3xl text-white mb-4 relative z-10">
              Siap Meningkatkan Reputasi Bisnis Anda di Google?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto text-sm sm:text-base relative z-10">
              Mulai kumpulkan ulasan positif pelanggan lama Anda dengan mudah hari ini dengan alat cerdas ini.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full !bg-white !text-brand-700 hover:!bg-slate-50 px-8">
                  Pesan via WhatsApp
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" className="w-full !bg-transparent border border-white/40 text-white hover:!bg-white/10 px-8 shadow-none">
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
              <div className="w-8 h-8 flex items-center justify-center relative mix-blend-multiply">
                <Image src="/logo.png" alt="Cobascan" width={100} height={100} className="w-full h-full object-contain" />
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
