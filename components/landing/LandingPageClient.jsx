"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Sparkles,
  ArrowRight,
  Play,
  X,
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
  Instagram,
  MapPin,
  Smartphone,
  UserPlus,
  Store,
  LayoutDashboard,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Truck,
  Palette
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function LandingPageClient({ whatsappBaseUrl }) {
  const container = useRef();
  const [activeDemo, setActiveDemo] = useState(null); // null, 1, or 2

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveDemo(null);
    };
    if (activeDemo !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDemo]);

  const waOrderSingle = `${whatsappBaseUrl}?text=${encodeURIComponent(
    "Halo admin COBASCAN, saya ingin pesan Paket COBASCAN Promo Rp89.000 (Plat Akrilik NFC/QR + Stand Penyangga + Perekat 3M Terpasang + Kertas Panduan Aktivasi + Free Ongkir). Boleh info pengirimannya?"
  )}`;
  const waOrderBulk = `${whatsappBaseUrl}?text=${encodeURIComponent(
    "Halo admin COBASCAN, saya ingin tanya info Paket Plat & Stand Akrilik COBASCAN untuk bisnis saya."
  )}`;
  const waCustomBrand = `${whatsappBaseUrl}?text=${encodeURIComponent(
    "Halo admin COBASCAN, saya tertarik konsultasi pemesanan Stand Akrilik dengan custom logo/brand bisnis saya sendiri. Boleh info detail dan ketentuannya?"
  )}`;

  useGSAP(() => {
    // 1. Hero Section Intro (Stagger & Fade In Up)
    const tl = gsap.timeline();
    tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 })
      .from('.hero-title', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4')
      .from('.hero-buttons', { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .from('.hero-stats', { opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.hero-image', { 
        x: 50, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power3.out',
        rotation: 5
      }, '-=1');

    // 2. Micro-interactions: Button Hover Effects
    const ctas = gsap.utils.toArray('.btn-hover-effect');
    ctas.forEach(btn => {
      btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power1.out' }));
      btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.out' }));
    });

    // 3. Scroll Reveal: Floating Bar Metrics
    gsap.from('.metric-card', {
      scrollTrigger: {
        trigger: '.metrics-container',
        start: 'top 90%',
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    });

    // Scroll Reveal: Komparasi Alur Ulasan
    gsap.from('.compare-card', {
      scrollTrigger: {
        trigger: '.compare-container',
        start: 'top 85%',
      },
      y: 35,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    });

    // Scroll Reveal: Cara Kerja Steps
    gsap.from('.step-card', {
      scrollTrigger: {
        trigger: '.steps-container',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: 'power2.out'
    });

    // Scroll Reveal: Setup Perangkat
    gsap.from('.setup-card', {
      scrollTrigger: {
        trigger: '.setup-container',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'power2.out'
    });

    // Scroll Reveal: Keunggulan Features
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-container',
        start: 'top 85%',
      },
      scale: 0.9,
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.5)'
    });

    // Scroll Reveal: Solusi
    gsap.from('.solution-card', {
      scrollTrigger: {
        trigger: '.solutions-container',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: 'power2.out'
    });

    // Scroll Reveal: Testimonials
    gsap.from('.testi-card', {
      scrollTrigger: {
        trigger: '.testi-container',
        start: 'top 85%',
      },
      x: -30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: 'power2.out'
    });
    
    // Scroll Reveal: Pricing
    gsap.from('.pricing-card', {
      scrollTrigger: {
        trigger: '.pricing-container',
        start: 'top 80%',
      },
      y: 50,
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.2)'
    });
  }, { scope: container });

  return (
    <div ref={container} className="w-full flex flex-col relative z-0">
      {/* Hero Section */}
      <section className="relative pt-8 pb-14 sm:pt-20 sm:pb-28 bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Subtle decorative color shapes */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Category Pill */}
              <div className="hero-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold mb-3 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                <span>Plat &amp; Stand Akrilik • Free Ongkir</span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-title text-2xl sm:text-4xl lg:text-[46px] font-black text-slate-900 tracking-tight leading-snug sm:leading-tight mb-2.5 sm:mb-4">
                Ulasan{' '}
                <span className="inline-flex items-center tracking-normal font-black">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                  <span className="text-slate-900 ml-1.5">Maps</span>
                </span>{' '}
                &amp; Wi-Fi Cukup 1x Tap di Meja
              </h1>

              {/* Subheadline */}
              <p className="hero-subtitle text-xs sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 mb-4 sm:mb-5 leading-relaxed">
                Tamu cukup dekatkan smartphone ke plat akrilik—formulir ulasan resmi langsung terbuka dan kata sandi Wi-Fi otomatis tersambung tanpa perlu repot tanya kasir.
              </p>

              {/* 4 Feature Highlights - Sejajar Rapi 2 Kolom di Mobile, 1 Baris di Layar Lebar */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs font-semibold text-slate-700 max-w-xs sm:max-w-none mx-auto lg:mx-0 mb-5 sm:mb-6">
                <div className="flex items-center gap-1.5 justify-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Ulasan Google</span>
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Konek Wi-Fi</span>
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Opsi Custom Brand</span>
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Free Ongkir</span>
                </div>
              </div>

              {/* Exploration Actions (Bukan Hard-selling Pesan di Hero) */}
              <div className="hero-buttons flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-5 sm:mb-6">
                <Link href="#cara-kerja">
                  <button className="btn-hover-effect px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl inline-flex items-center gap-1.5 text-xs sm:text-sm shadow-sm transition-transform">
                    <span>Pelajari Cara Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveDemo(1)}
                  className="btn-hover-effect px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200/80 inline-flex items-center gap-1.5 text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-blue-700 text-blue-700" />
                  <span>Demo 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemo(2)}
                  className="btn-hover-effect px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200/80 inline-flex items-center gap-1.5 text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
                  <span>Demo 2</span>
                </button>
                <Link href="#harga">
                  <button className="btn-hover-effect px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl inline-flex items-center gap-1.5 text-xs sm:text-sm transition-colors">
                    <span>Lihat Harga</span>
                  </button>
                </Link>
              </div>

              {/* Social Proof Text */}
              <div className="hero-stats flex items-center justify-center lg:justify-start gap-2 pt-0.5 text-xs text-slate-500">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden relative shrink-0">
                    <Image src="/images/cafe-latte.jpg" alt="Pengguna" fill sizes="100vw" className="object-cover" />
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden relative shrink-0">
                    <Image src="/images/beauty-clinic.jpg" alt="Pengguna" fill sizes="100vw" className="object-cover" />
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden relative shrink-0">
                    <Image src="/images/restaurant-dish.jpg" alt="Pengguna" fill sizes="100vw" className="object-cover" />
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs">Dipercaya oleh <strong>1.000+</strong> bisnis di Indonesia</span>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="hero-image lg:col-span-5 relative mx-auto w-full max-w-[260px] sm:max-w-[340px] lg:max-w-none">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white p-2.5 sm:p-3 group">
                <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  <Image
                    src="/images/acrylic-table-plate.jpg"
                    alt="Stand Akrilik COBASCAN di Meja Kasir"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    priority
                    sizes="(max-width: 768px) 260px, 480px"
                  />
                  {/* Putar Demo 1 (Kiri Bawah Pojok) */}
                  <button
                    type="button"
                    onClick={() => setActiveDemo(1)}
                    className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-blue-600 text-white backdrop-blur-md shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
                    aria-label="Putar Video Demo 1"
                    title="Putar Demo 1"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 group-hover/btn:bg-white text-white group-hover/btn:text-blue-600 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                      <Play className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current translate-x-0.5" />
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold tracking-tight pr-0.5">Putar Demo 1</span>
                  </button>

                  {/* Putar Demo 2 (Kanan Bawah Pojok) */}
                  <button
                    type="button"
                    onClick={() => setActiveDemo(2)}
                    className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-emerald-600 text-white backdrop-blur-md shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
                    aria-label="Putar Video Demo 2"
                    title="Putar Demo 2"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 group-hover/btn:bg-white text-white group-hover/btn:text-emerald-600 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                      <Play className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current translate-x-0.5" />
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold tracking-tight pr-0.5">Putar Demo 2</span>
                  </button>

                  {/* Badge Stiker Ulasan (Pojok Kanan Atas di Dalam Foto) */}
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-md text-[10px] sm:text-xs font-bold text-slate-800 flex items-center gap-1 select-none pointer-events-none">
                    <span>Formulir Ulasan Langsung Muncul</span>
                    <span>⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Technical Metrics Floating Bar - Reflow to 2x2 Grid on Mobile */}
      <div className="metrics-container max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 -mt-5 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-6 shadow-xl shadow-slate-200/60 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* 1 Detik */}
          <div className="metric-card flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 p-2 sm:p-0 rounded-xl bg-slate-50/70 sm:bg-transparent">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm sm:shadow-md shadow-emerald-500/20">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <div>
              <div className="text-xs sm:text-base font-black text-slate-900">1 Detik</div>
              <div className="text-[11px] sm:text-xs text-slate-600 leading-snug mt-0.5">
                Respon instan saat HP tamu ditempelkan.
              </div>
            </div>
          </div>

          {/* Chip NFC */}
          <div className="metric-card flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 p-2 sm:p-0 rounded-xl bg-slate-50/70 sm:bg-transparent">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm sm:shadow-md shadow-blue-500/20">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-base font-black text-slate-900">Chip NFC Pintar</div>
              <div className="text-[11px] sm:text-xs text-slate-600 leading-snug mt-0.5">
                Otomatis terbaca semua iPhone &amp; Android.
              </div>
            </div>
          </div>

          {/* Stand Akrilik */}
          <div className="metric-card flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 p-2 sm:p-0 rounded-xl bg-slate-50/70 sm:bg-transparent">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm sm:shadow-md shadow-red-500/20">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-base font-black text-slate-900">Stand Akrilik</div>
              <div className="text-[11px] sm:text-xs text-slate-600 leading-snug mt-0.5">
                Elegan, tahan tumpahan minuman.
              </div>
            </div>
          </div>

          {/* 100% Pasif */}
          <div className="metric-card flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 p-2 sm:p-0 rounded-xl bg-slate-50/70 sm:bg-transparent">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm sm:shadow-md shadow-amber-500/20">
              <BatteryCharging className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-base font-black text-slate-900">100% Pasif</div>
              <div className="text-[11px] sm:text-xs text-slate-600 leading-snug mt-0.5">
                Bebas baterai &amp; tanpa kabel listrik.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Komparasi Alur Ulasan */}
      <section className="py-12 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="compare-container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5 sm:mb-2 block">
              KENAPA TAMU SERING BATAL KASIH ULASAN?
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-3">
              Mempermudah Pelanggan, Menghilangkan Hambatan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Bukan karena tamu tidak puas, tapi karena cara manual membutuhkan terlalu banyak langkah yang membosankan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Kolom 1: Cara Biasa */}
            <div className="compare-card bg-white rounded-2xl border border-rose-200/80 p-5 sm:p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold mb-3 sm:mb-4">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Cara Manual (5 Langkah Ribet)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                  Banyak Tamu Keburu Malas di Jalan
                </h3>
                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <span>Tamu harus buka aplikasi Google Maps manual di smartphone.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <span>Ketik nama toko (sering salah eja atau keliru memilih cabang).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <span>Scroll ke bawah mencari tab ulasan / tombol beri bintang.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <span>Kasir / staf sering sungkan atau lupa mengingatkan pelanggan.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-rose-100 text-xs font-semibold text-rose-600">
                ✕ Akibatnya: Tamu yang puas pun pulang tanpa meninggalkan ulasan.
              </div>
            </div>

            {/* Kolom 2: Pakai Stand Akrilik COBASCAN */}
            <div className="compare-card bg-white rounded-2xl border-2 border-emerald-500 p-5 sm:p-7 shadow-lg shadow-emerald-500/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl">
                Solusi Cepat 1 Detik
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-3 sm:mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dengan Stand Akrilik COBASCAN</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                  Tamu Cukup Dekatkan HP di Meja
                </h3>
                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span><strong>1x Tap / Scan:</strong> Dekatkan HP ke stand akrilik (tanpa perlu install aplikasi apa pun).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span><strong>Halaman Terbuka Otomatis:</strong> Layar HP langsung menampilkan formulir ulasan Google Maps resmi bisnis Anda.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span><strong>Praktis &amp; Cepat:</strong> Tamu tinggal pilih bintang dan kirim. Selesai dalam hitungan detik.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span><strong>Akses Wi-Fi Instan:</strong> Kata sandi Wi-Fi otomatis dibagikan ke tamu tanpa staf/kasir harus menjawab berulang kali.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-emerald-100 text-xs font-semibold text-emerald-700">
                ✓ Hasilnya: Mempermudah tamu memberi apresiasi tanpa merepotkan kasir.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-12 sm:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA4335] mb-1.5 sm:mb-2 block">
              CARA KERJA
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              3 Langkah Mudah bagi Pengunjung
            </h2>
          </div>

          <div className="steps-container grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 relative items-stretch">
            {/* Step 01 */}
            <div className="step-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-100">
                <Image src="/images/step-tap-nfc.jpg" alt="Tamu Tap atau Scan" fill sizes="100vw" className="object-cover" />
                <div className="absolute top-3 left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A73E8] text-white font-bold text-xs flex items-center justify-center shadow">
                  01
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Tamu Tap atau Scan</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tamu menempelkan smartphone ke logo NFC atau memindai kode QR menggunakan kamera HP biasa (tanpa instal aplikasi apapun).
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="step-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-100">
                <Image src="/images/step-google-review.jpg" alt="Halaman Ulasan Langsung Terbuka" fill sizes="100vw" className="object-cover" />
                <div className="absolute top-3 left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EA4335] text-white font-bold text-xs flex items-center justify-center shadow">
                  02
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Halaman Ulasan Langsung Terbuka</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tamu diarahkan secara otomatis ke formulir ulasan resmi Google Maps bisnis Anda tanpa perlu mengetik nama toko manual.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="step-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-100">
                <Image src="/images/step-wifi-success.jpg" alt="Tamu Berikan Rating & Ulasan" fill sizes="100vw" className="object-cover" />
                <div className="absolute top-3 left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#34A853] text-white font-bold text-xs flex items-center justify-center shadow">
                  03
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Ulasan Terkirim &amp; Konek Wi-Fi</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tamu memberikan rating bintang secara instan dan langsung menerima kata sandi Wi-Fi untuk berselancar internet tanpa perlu repot bertanya ke kasir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Aktivasi Section - Reflow to 2x2 Grid on Mobile */}
      <section className="py-12 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5 sm:mb-2 block">
              SETUP PERANGKAT
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">
              Aktivasi Cepat Kurang Dari 1 Menit
            </h2>
            <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto">
              Anda tidak perlu mendaftar ribet. Beli produknya, scan dengan HP Anda, dan perangkat siap digunakan untuk bisnis Anda.
            </p>
          </div>

          <div className="setup-container grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="setup-card bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center h-full">
              <div className="relative mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold absolute -top-1.5 -right-1.5 ring-2 ring-white shadow-sm">
                  1
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-slate-900 mb-1 sm:mb-1.5">Scan atau Tap</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">Ikuti kertas panduan di paket, scan QR atau tap NFC untuk mulai.</p>
            </div>

            {/* Step 2 */}
            <div className="setup-card bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center h-full">
              <div className="relative mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold absolute -top-1.5 -right-1.5 ring-2 ring-white shadow-sm">
                  2
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-slate-900 mb-1 sm:mb-1.5">Buat Akun</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">Masukkan Nomor WhatsApp &amp; PIN rahasia untuk dashboard.</p>
            </div>

            {/* Step 3 */}
            <div className="setup-card bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center h-full">
              <div className="relative mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold absolute -top-1.5 -right-1.5 ring-2 ring-white shadow-sm">
                  3
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-slate-900 mb-1 sm:mb-1.5">Data Bisnis</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">Isi link Google Maps &amp; kata sandi Wi-Fi pelanggan.</p>
            </div>

            {/* Step 4 */}
            <div className="setup-card bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center h-full">
              <div className="relative mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                  <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold absolute -top-1.5 -right-1.5 ring-2 ring-white shadow-sm">
                  4
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-slate-900 mb-1 sm:mb-1.5">Kelola Dashboard</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">Pantau ulasan, ubah Wi-Fi kapan saja tanpa ganti akrilik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Section - Reflow to 2x2 Grid on Mobile */}
      <section id="keunggulan" className="py-12 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5 sm:mb-2 block">
              KEUNGGULAN
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Dirancang untuk Bisnis Anda
            </h2>
          </div>

          <div className="features-container grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* Card 1 */}
            <div className="feature-card bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2.5 sm:mb-5 shadow-sm shadow-purple-500/20">
                <Palette className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 mb-1 sm:mb-2">Opsi Custom Brand</h3>
              <p className="text-[11px] sm:text-xs sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
                Ingin cetak logo &amp; warna brand Anda? Bisa konsultasi khusus via WhatsApp.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-red-500 text-white flex items-center justify-center mb-2.5 sm:mb-5 shadow-sm shadow-red-500/20">
                <Battery className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 mb-1 sm:mb-2">100% Tanpa Baterai</h3>
              <p className="text-[11px] sm:text-xs sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
                Bekerja dengan induksi HP pengunjung. Tidak perlu dicharge seumur hidup.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2.5 sm:mb-5 shadow-sm shadow-blue-500/20">
                <Droplets className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 mb-1 sm:mb-2">Tahan Air &amp; Noda</h3>
              <p className="text-[11px] sm:text-xs sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
                QR &amp; chip tertanam dalam akrilik, aman dari tumpahan kopi dan mudah dilap.
              </p>
            </div>

            {/* Card 4 */}
            <div className="feature-card bg-[#FAFAFA] rounded-2xl border border-slate-200/90 p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2.5 sm:mb-5 shadow-sm shadow-amber-500/20">
                <Link2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 mb-1 sm:mb-2">Tautan Fleksibel</h3>
              <p className="text-[11px] sm:text-xs sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
                Password Wi-Fi atau Maps berubah, ganti di dashboard. Akrilik tetap dipakai!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skenario Penggunaan */}
      <section id="solusi" className="py-12 sm:py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5 sm:mb-2 block">
              COCOK UNTUK BERBAGAI JENIS USAHA
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Solusi untuk Setiap Bisnis
            </h2>
          </div>

          <div className="solutions-container grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="solution-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <Image src="/images/cafe-latte.jpg" alt="Kafe & Coffee Shop" fill sizes="100vw" className="object-cover" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Kafe &amp; Coffee Shop</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diletakkan di meja makan &amp; kasir (tamu santai ulas rasa/suasana sambil akses Wi-Fi).
                </p>
              </div>
            </div>

            <div className="solution-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <Image src="/images/beauty-clinic.jpg" alt="Klinik & Salon Kecantikan" fill sizes="100vw" className="object-cover" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Klinik &amp; Salon Kecantikan</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diletakkan di resepsionis/ruang tunggu (merekam ulasan saat pelanggan puas selesai treatment).
                </p>
              </div>
            </div>

            <div className="solution-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <Image src="/images/restaurant-dish.jpg" alt="Restoran & Retail Offline" fill sizes="100vw" className="object-cover" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Restoran &amp; Retail Offline</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diletakkan di kasir &amp; pintu keluar untuk mendongkrak ranking lokal Google Maps di kota Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apa Kata Mereka (Testimonials) */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5 sm:mb-2 block">
              APA KATA MEREKA
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Lebih dari 1.000 Pemilik Bisnis Telah Membuktikan
            </h2>
          </div>

          <div className="testi-container grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="testi-card bg-[#FAFAFA] rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic mb-4 sm:mb-6 leading-relaxed">
                  &quot;Semenjak pakai COBASCAN di setiap meja kafe, ulasan Google Maps kami bertambah setiap hari dari 4.1 jadi 4.8. Pelanggan senang karena dapat akses Wi-Fi dengan mudah cukup sekali tap HP, dan meja kafe jadi terlihat jauh lebih rapi dan modern!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                  <Image src="/images/cafe-latte.jpg" alt="Reviewer" fill sizes="100vw" className="object-cover" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">Budi Santoso</div>
                  <div className="text-[11px] sm:text-xs text-slate-500">Pemilik Kedai Kopi Senja</div>
                </div>
              </div>
            </div>

            <div className="testi-card bg-[#FAFAFA] rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic mb-4 sm:mb-6 leading-relaxed">
                  &quot;Sangat mempermudah operasional. Kasir tidak perlu lagi repot menjawab pertanyaan password Wi-Fi berulang kali. Bentuk stand akriliknya juga elegan, bikin meja restoran terlihat lebih profesional.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                  <Image src="/images/restaurant-dish.jpg" alt="Reviewer" fill sizes="100vw" className="object-cover" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">Diana Safira</div>
                  <div className="text-[11px] sm:text-xs text-slate-500">Manajer Resto Nusantara</div>
                </div>
              </div>
            </div>

            <div className="testi-card bg-[#FAFAFA] rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic mb-4 sm:mb-6 leading-relaxed">
                  &quot;Dulu pelanggan salon sering lupa kasih review walau puas. Sekarang karena mau Wi-Fi sambil nunggu antrian, mereka otomatis nge-tap dan ninggalin review positif. Efeknya luar biasa ke pencarian lokal!&quot;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                  <Image src="/images/beauty-clinic.jpg" alt="Reviewer" fill sizes="100vw" className="object-cover" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">Sari Wulandari</div>
                  <div className="text-[11px] sm:text-xs text-slate-500">Owner Klinik Cantik Ayu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-12 sm:py-20 bg-slate-50/60 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] mb-1.5 sm:mb-2 block">
              PILIHAN HARGA
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2">
              Investasi Sekali Bayar, Tanpa Biaya Bulanan
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
              Beli putus untuk stand akrilik fisik dan akses sistem. Bebas biaya langganan.
            </p>
          </div>

          <div className="pricing-container max-w-md mx-auto">
            <div className="pricing-card bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/50">
              {/* Product Header */}
              <div className="text-center pb-5 border-b border-slate-100">
                <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-2">
                  Paket Siap Pakai
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Plat &amp; Stand Akrilik COBASCAN
                </h3>

                {/* Price */}
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-400 line-through">Rp 129.000</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">Hemat 31%</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Rp 89.000</span>
                    <span className="text-xs text-slate-400 font-medium">/ paket</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center justify-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>FREE ONGKIR KE SELURUH INDONESIA</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <ul className="py-5 space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1x Plat Akrilik Tebal 2mm</strong> (Chip NFC Pintar + QR Code)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1x Stand Penyangga Akrilik</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Perekat 3M Kuat</strong> (Sudah Terpasang, Siap Tempel)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Kertas Panduan Fisik</strong> Cara Aktivasi (&lt; 1 Menit)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct link resmi ke formulir ulasan Google Maps</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Bagikan kata sandi Wi-Fi instan tanpa tanya kasir</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Akses Dashboard Owner (bebas ganti link)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">
                    Garansi 100% Ganti Baru jika akrilik pecah di pengiriman &amp; jika chip NFC tidak terbaca
                  </span>
                </li>
              </ul>

              {/* Action Button */}
              <div className="pt-2">
                <a
                  href={waOrderSingle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <button className="btn-hover-effect w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-colors">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Pesan via WhatsApp Sekarang</span>
                  </button>
                </a>
              </div>

              {/* Custom Brand Single-line Link */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Ingin custom logo brand sendiri?{' '}
                  <a
                    href={waCustomBrand}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 font-bold underline hover:text-purple-800"
                  >
                    Konsultasi via WA
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-slate-100">
            {/* Col 1 */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 relative">
                  <Image src="/cobascan-logo.png" alt="COBASCAN" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-slate-900 text-xl pt-0.5">COBASCAN</span>
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
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>+62 858-8815-9265</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href="https://www.instagram.com/cobascan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-600 transition-colors"
                  >
                    @cobascan
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Indonesia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 COBASCAN. Seluruh hak cipta dilindungi.</p>
            <p className="flex items-center gap-1">
              Tap, Review, Connect. <span className="text-red-500">❤️</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp CTA Button (Sticky on Mobile & Desktop) */}
      <aside aria-label="Bantuan Pemesanan WhatsApp" className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
        <a
          href={waOrderBulk}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-xl shadow-emerald-600/30 border border-white/20 transition-transform hover:scale-105 active:scale-95"
          title="Tanya Promo via WhatsApp"
        >
          <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5 fill-white" />
          <span className="hidden sm:inline text-xs font-bold ml-2">
            Tanya Promo WA
          </span>
        </a>
      </aside>

      {/* Video Demo Modal */}
      {activeDemo !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveDemo(null)}
        >
          <div 
            className={`relative w-full ${activeDemo === 2 ? 'max-w-xs sm:max-w-sm' : 'max-w-2xl'} bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/95">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {activeDemo === 1 ? 'Demo 1: Alur Tap NFC & QR Code' : 'Demo 2: Tampilan di Smartphone'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDemo(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Tutup video demo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Switch Tabs inside Modal */}
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-950/70 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveDemo(1)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeDemo === 1 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Demo 1</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDemo(2)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeDemo === 2 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Demo 2</span>
              </button>
            </div>

            {/* Video Player Container */}
            <div className={`relative ${activeDemo === 2 ? 'aspect-[9/16] max-h-[70vh]' : 'aspect-video'} w-full bg-black flex items-center justify-center`}>
              <video 
                key={activeDemo}
                src={activeDemo === 1 ? '/videos/demo1.mp4' : '/videos/demo2.mp4'} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full object-contain"
              >
                Browser Anda tidak mendukung pemutar video HTML5.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
              <span>{activeDemo === 1 ? 'Demo widescreen 16:9 akrilik' : 'Demo tampilan vertikal 9:16 HP'}</span>
              <button
                type="button"
                onClick={() => setActiveDemo(null)}
                className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Tutup (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
