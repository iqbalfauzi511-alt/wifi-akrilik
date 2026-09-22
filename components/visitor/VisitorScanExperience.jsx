'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Wifi,
  Star,
  Copy,
  Check,
  Radio,
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function VisitorScanExperience({
  code,
  businessName = 'Kopi ABC',
  logoUrl,
  googleMapsReviewUrl,
  googleMapsUrl,
  wifiEnabled = true,
  wifiName = 'KopiABC_5G',
  scanCount = 142,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedWifiPassword, setRevealedWifiPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSimulatorContext, setShowSimulatorContext] = useState(true);

  const targetMapsUrl = googleMapsReviewUrl || googleMapsUrl || 'https://maps.google.com/';

  // Reveal Wi-Fi password via secured API
  const handleRevealPassword = async () => {
    if (isRevealing || isRevealed) return;
    try {
      setIsRevealing(true);
      setErrorMessage('');

      const res = await fetch(`/api/q/${encodeURIComponent(code)}/reveal-wifi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setErrorMessage(data?.error || 'Gagal memuat password Wi-Fi. Silakan coba lagi.');
        setIsRevealing(false);
        return;
      }

      setRevealedWifiPassword(data.wifi_password || '');
      setIsRevealed(true);
    } catch (err) {
      setErrorMessage('Terjadi kendala jaringan saat membuka password Wi-Fi.');
    } finally {
      setIsRevealing(false);
    }
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!revealedWifiPassword) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(revealedWifiPassword).catch(() => {
        fallbackCopy(revealedWifiPassword);
      });
    } else {
      fallbackCopy(revealedWifiPassword);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fallbackCopy = (text) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch (e) {
      console.warn('Fallback copy error:', e);
    }
  };

  const handleReviewClick = () => {
    setHasReviewed(true);
    if (typeof window !== 'undefined') {
      window.open(targetMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
      {/* Top Header Bar: Cobascan Physical Stand Simulator */}
      <div className="hidden lg:flex items-center justify-between pb-6 mb-8 border-b border-slate-200/90">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Cobascan Physical Stand Simulator
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                LIVE EXPERIENCE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time dynamic endpoint rendered upon NFC tap or QR scan at Counter Stand #04
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SSID: {wifiName || 'KopiABC_5G'}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSimulatorContext(!showSimulatorContext)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>{showSimulatorContext ? 'Mobile Frame Only' : 'Show Hardware Mirror'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Hardware Mirror on Left + Smartphone Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        {/* LEFT COLUMN: Acrylic Hardware Mirror (Visible on Desktop Simulator) */}
        {showSimulatorContext && (
          <div className="hidden lg:block lg:col-span-5 space-y-5">
            {/* Mirror Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  ACRYLIC HARDWARE MIRROR
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Check className="w-3 h-3 text-blue-600" />
                  NFC NTAG424
                </span>
              </div>

              {/* Photo Banner with Stand Mockup */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group shadow-inner">
                <Image
                  src="/images/acrylic-stand-cafe.jpg"
                  alt="Acrylic Stand at Cafe"
                  fill
                  className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{businessName || 'Counter Stand #04'}</h4>
                    <p className="text-[11px] text-slate-300 font-medium">Artisan Wood Table &bull; Main Cashier Area</p>
                  </div>
                  {logoUrl && (
                    <div className="w-9 h-9 rounded-xl bg-white/95 p-1 border border-white/40 shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt={businessName} className="w-full h-full object-contain rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Today&apos;s Total Scans
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{scanCount}</span>
                    <span className="text-xs font-bold text-emerald-600">+18%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">89 NFC &bull; 53 QR</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Conversion Split
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-600 tracking-tight">64%</span>
                    <span className="text-xs font-bold text-slate-500">Review</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">36% Guest Wi-Fi</div>
                </div>
              </div>

              {/* Zero-Gate UX Guarantee Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero-Gate UX Guarantee</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed pl-5.5">
                  Google review request and Wi-Fi access are completely decoupled. Guests enjoy unconditioned complimentary connectivity without mandatory rating gates.
                </p>
              </div>
            </div>

            {/* Dynamic Smart Redirects Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                DYNAMIC SMART REDIRECTS
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    <span>Google Review Intent</span>
                  </div>
                  <a
                    href={targetMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] font-semibold text-blue-600 hover:underline truncate max-w-[160px]"
                  >
                    {targetMapsUrl.replace(/^https?:\/\//, '').split('?')[0]}
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Wifi className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Wi-Fi Direct Protocol</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-600">
                    WPA2/WPA3 Direct-Enroll
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: The Interactive Smartphone Experience (iPhone Frame) */}
        <div className={`w-full flex justify-center ${showSimulatorContext ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {/* Smartphone Bezel */}
          <div className="w-full max-w-[400px] rounded-[48px] p-3.5 bg-slate-950 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 transition-all">
            {/* Smartphone Inner Screen */}
            <div className="w-full rounded-[40px] bg-slate-50/90 overflow-hidden text-slate-900 border border-slate-200/50 flex flex-col min-h-[660px] relative">
              
              {/* iOS Status Bar */}
              <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-900 select-none">
                <span>09:41</span>
                {/* Dynamic Island Notch */}
                <div className="h-5 w-24 rounded-full bg-black mx-auto flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                  <div className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-[10px] font-bold">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <div className="w-5 h-2.5 rounded-sm border border-slate-700 p-0.5 flex items-center">
                    <div className="h-full w-3/4 bg-slate-800 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Screen Body */}
              <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
                {/* Cobascan Instant Connect Pill */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-medium text-slate-700">
                    <Radio className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cobascan Instant Connect</span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                </div>

                {/* Business Avatar & Greeting Header */}
                <div className="text-center space-y-1.5 pt-1">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center mx-auto text-amber-700 overflow-hidden relative p-1">
                    {logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={logoUrl}
                        alt={businessName}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl select-none">☕</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {businessName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Specialty Brews &amp; Artisanal Roastery
                  </p>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto pt-1 leading-relaxed">
                    Welcome to <strong className="text-slate-900">{businessName}</strong>! We&apos;re thrilled to have you here today.
                  </p>
                </div>

                {/* CARD 1: Share your experience (Google Review) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>5.0 Google Feedback</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      {/* Google G SVG */}
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Takes ~15s</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">Share your experience</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Your feedback helps our small team grow and makes your coffee better every single day.
                    </p>
                  </div>

                  {/* Interactive Star Rating Selector */}
                  <div className="flex items-center justify-center gap-2 py-1 bg-amber-50/40 rounded-xl border border-amber-100">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || selectedRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => {
                            setSelectedRating(star);
                            handleReviewClick();
                          }}
                          className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                          title={`Beri bintang ${star}`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 stroke-[1.5]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Primary Google Review Button */}
                  <button
                    type="button"
                    onClick={handleReviewClick}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.99] transition-all shadow-md shadow-blue-500/25"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Review us on Google</span>
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 ml-0.5" />
                  </button>

                  {hasReviewed && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 text-center flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Terima kasih! Ulasan Google Anda sangat berarti bagi kami.</span>
                    </div>
                  )}
                </div>

                {/* CARD 2: Free Guest Wi-Fi (when wifiEnabled) */}
                {wifiEnabled && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center">
                          <Wifi className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Free Guest Wi-Fi</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        High Speed
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Connect to fast internet during your visit. No registration or mandatory review required.
                    </p>

                    {/* Network & Password Credential Box */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                          NETWORK
                        </span>
                        <span className="font-mono font-bold text-slate-900">{wifiName || 'KopiABC'}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                          PASSWORD
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 tracking-widest text-sm">
                            {isRevealed ? revealedWifiPassword : '••••••••••••'}
                          </span>
                          {!isRevealed ? (
                            <button
                              type="button"
                              onClick={handleRevealPassword}
                              disabled={isRevealing}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 transition-colors shadow-2xs disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              {isRevealing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              <span>{isRevealing ? 'Loading' : 'Reveal'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleCopyPassword}
                              className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                              title="Salin Password"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Connect to Wi-Fi Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isRevealed) {
                          handleRevealPassword();
                        } else {
                          handleCopyPassword();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20"
                    >
                      <Wifi className="w-4 h-4" />
                      <span>{isRevealed ? (copied ? 'Password Copied ✓' : 'Copy Wi-Fi Password') : 'Connect to Wi-Fi'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* iOS Screen Footer */}
              <div className="p-3 bg-white/70 border-t border-slate-200/60 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
                  <span>Powered by</span>
                  <strong className="text-slate-800">Cobascan</strong>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block ml-0.5" />
                </div>
                <p className="text-[9px] text-slate-400 font-mono">
                  Protected by End-to-End Dynamic Redirection
                </p>
                {/* iPhone Home Indicator Bar */}
                <div className="w-32 h-1 bg-slate-400/80 rounded-full mx-auto mt-2" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
