'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Star,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Loader2,
  AlertCircle,
  Eye,
  Building,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function VisitorScanExperience({
  code,
  businessName = 'Cobascan Partner',
  logoUrl,
  googleMapsReviewUrl,
  googleMapsUrl,
  wifiEnabled = true,
  wifiName = 'Wi-Fi Tamu',
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedWifiPassword, setRevealedWifiPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    <div className="w-full max-w-md mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-4">
      {/* Business Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-center space-y-3">
        {/* Business Logo / Icon */}
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-inner flex items-center justify-center mx-auto overflow-hidden p-1.5">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt={businessName}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building className="w-8 h-8 text-amber-600" />
            </div>
          )}
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold mb-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Terverifikasi di Cobascan</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {businessName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Selamat datang! Nikmati layanan dan fasilitas terbaik kami selama kunjungan Anda.
          </p>
        </div>
      </div>

      {/* CARD 1: Google Review (Fokus Utama) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>Google Review</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Hanya butuh ~15 detik
          </span>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Bagikan Pengalaman Anda
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ulasan dan rating bintang 5 Anda di Google Maps sangat berharga bagi perkembangan kami.
          </p>
        </div>

        {/* Interactive Star Rating Selector */}
        <div className="flex items-center justify-center gap-2 py-2 bg-amber-50/40 rounded-2xl border border-amber-100">
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
                className="p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                title={`Beri bintang ${star}`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 stroke-[1.5]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Primary Google Review CTA Button */}
        <button
          type="button"
          onClick={handleReviewClick}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.99] transition-all shadow-md shadow-blue-500/25"
        >
          {/* Google G Multi-color Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#ffffff"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#ffffff"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#ffffff"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#ffffff"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Tulis Ulasan di Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
        </button>

        {hasReviewed && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 text-center flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Terima kasih! Ulasan Google Anda sangat berarti bagi kami. 🙏</span>
          </div>
        )}
      </div>

      {/* CARD 2: Free Guest Wi-Fi (Ketika Wi-Fi Aktif) */}
      {wifiEnabled && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900">
                Akses Wi-Fi Tamu
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gratis
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Gunakan jaringan internet khusus pengunjung secara gratis selama Anda berada di sini.
          </p>

          {/* Wi-Fi Credentials Box */}
          <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-3.5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                NAMA WI-FI (SSID)
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                {wifiName || 'Wi-Fi Tamu'}
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                PASSWORD
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-slate-900 tracking-wider text-sm sm:text-base">
                  {isRevealed ? revealedWifiPassword : '••••••••••••'}
                </span>

                {!isRevealed ? (
                  <button
                    type="button"
                    onClick={handleRevealPassword}
                    disabled={isRevealing}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isRevealing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>{isRevealing ? 'Membuka...' : 'Buka Password'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors inline-flex items-center gap-1"
                    title="Salin Password Wi-Fi"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Connect / Copy Action Button */}
          <button
            type="button"
            onClick={() => {
              if (!isRevealed) {
                handleRevealPassword();
              } else {
                handleCopyPassword();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all shadow-sm"
          >
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>
              {isRevealed
                ? copied
                  ? 'Password Berhasil Disalin ✓'
                  : 'Salin Password Wi-Fi'
                : 'Buka & Hubungkan ke Wi-Fi'}
            </span>
          </button>
        </div>
      )}

      {/* Clean Modern Footer */}
      <div className="py-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Powered by</span>
          <strong className="text-slate-700 font-bold">Cobascan</strong>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" />
        </div>
        <p className="text-[10px] text-slate-400">
          Smart Acrylic Stand &bull; QR Code + NFC Table Portal
        </p>
      </div>
    </div>
  );
}
