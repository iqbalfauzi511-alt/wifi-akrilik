'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Star,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  LockKeyhole,
  UnlockKeyhole,
} from 'lucide-react';
import { trackVisitorAction } from '@/lib/actions/qr-actions';

// Stage constants
const STAGE = {
  RATING: 'rating',
  WAITING_RETURN: 'waiting_return',   // User switched to Maps, waiting for return
  PLACEBO_LOADING: 'placebo_loading', // 5s fake loading that runs WHEN USER RETURNS
  REDIRECTED: 'redirected',           // Review verified, ready to reveal WiFi
  DONE: 'done',                       // Rating complete & WiFi revealed
};

export default function VisitorScanExperience({
  code,
  businessName = 'Cobascan Partner',
  logoUrl,
  googleMapsReviewUrl,
  googleMapsUrl,
  wifiEnabled = false,
  wifiName = 'Wi-Fi Tamu',
  wifiPassword = '',
  whatsappNumber = '',
}) {
  const targetMapsUrl = googleMapsReviewUrl || googleMapsUrl || 'https://maps.google.com/';

  // All visitors start at RATING stage regardless of wifiEnabled
  const [stage, setStage] = useState(STAGE.RATING);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [copied, setCopied] = useState(false);
  // True once visitor goes through Google Maps path
  const [wifiEarned, setWifiEarned] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState(wifiPassword || '');
  const [revealedSsid, setRevealedSsid] = useState(wifiName || 'Wi-Fi Tamu');
  const [isRevealingWifi, setIsRevealingWifi] = useState(false);

  const redirectType = 'maps';

  // Placebo loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Memverifikasi...');
  const placeboTimerRef = useRef(null);

  // If owner did not enable Wi-Fi, immediately redirect directly to Google Maps
  useEffect(() => {
    if (!wifiEnabled && targetMapsUrl) {
      window.location.replace(targetMapsUrl);
    }
  }, [wifiEnabled, targetMapsUrl]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (placeboTimerRef.current) {
        clearInterval(placeboTimerRef.current);
      }
    };
  }, []);

  // Placebo Loading Runner: runs for exactly 5 seconds IN FRONT OF THE USER once they return
  const startPlaceboLoading = useCallback((type = 'maps') => {
    if (placeboTimerRef.current) {
      clearInterval(placeboTimerRef.current);
    }
    setStage(STAGE.PLACEBO_LOADING);
    setLoadingProgress(0);

    const DURATION = 5000; // 5 detik total di depan mata pengguna
    const startTime = Date.now();

    const getStatusText = (progress) => {
      if (type === 'maps') {
        if (progress < 25) return 'Mendeteksi Anda telah kembali...';
        if (progress < 55) return 'Mengecek status ulasan Google Maps...';
        if (progress < 85) return 'Memverifikasi ulasan bintang 5 Anda...';
        return 'Ulasan terverifikasi! Menyiapkan akses Wi-Fi...';
      } else {
        if (progress < 25) return 'Mendeteksi Anda telah kembali...';
        if (progress < 55) return 'Menghubungkan ke WhatsApp manajemen...';
        if (progress < 85) return 'Mengecek status pengiriman pesan...';
        return 'Laporan diterima! Menyiapkan akses Wi-Fi...';
      }
    };

    setLoadingText(getStatusText(0));

    placeboTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setLoadingProgress(progress);
      setLoadingText(getStatusText(progress));

      if (progress >= 100) {
        clearInterval(placeboTimerRef.current);
        placeboTimerRef.current = null;
        setStage(STAGE.REDIRECTED);
      }
    }, 100);
  }, []);

  // DETECT RETURN: When user returns to tab from Google Maps or WhatsApp, start Placebo Loading!
  useEffect(() => {
    if (stage !== STAGE.WAITING_RETURN) return;

    const handleTabReturn = () => {
      if (document.visibilityState === 'visible') {
        startPlaceboLoading(redirectType);
      }
    };

    const handleWindowFocus = () => {
      startPlaceboLoading(redirectType);
    };

    document.addEventListener('visibilitychange', handleTabReturn);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleTabReturn);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [stage, redirectType, startPlaceboLoading]);

  const fetchWifiCredentials = useCallback(async () => {
    if (!wifiEnabled) return;
    if (revealedPassword) return;
    setIsRevealingWifi(true);
    try {
      const res = await fetch(`/api/q/${encodeURIComponent(code)}/reveal-wifi`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data?.success && data?.wifi_password) {
        setRevealedPassword(data.wifi_password);
        if (data.wifi_name) setRevealedSsid(data.wifi_name);
      }
    } catch (err) {
      console.error('Failed to reveal wifi:', err);
    } finally {
      setIsRevealingWifi(false);
    }
  }, [code, wifiEnabled, revealedPassword]);

  const handleCopyPassword = () => {
    const pw = revealedPassword || wifiPassword;
    if (!pw) return;
    try {
      navigator.clipboard.writeText(pw);
    } catch {
      const el = document.createElement('textarea');
      el.value = pw;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    // Track Salin Password
    trackVisitorAction(code, 'salin_wifi').catch(() => {});
  };

  // Star click handler — all ratings go to Google Maps
  const handleStarClick = (value) => {
    setSelectedRating(value);
    const trackUrl = `/api/q/${encodeURIComponent(code)}/track?action=buka_review&url=${encodeURIComponent(targetMapsUrl)}`;
    window.open(trackUrl, '_blank', 'noopener,noreferrer');
    setStage(STAGE.WAITING_RETURN);
  };

  // Reveal WiFi: called from REDIRECTED stage
  const handleRevealWifi = () => {
    setWifiEarned(true);
    setStage(STAGE.DONE);
    fetchWifiCredentials();
    // Track Lihat WiFi
    trackVisitorAction(code, 'lihat_wifi').catch(() => {});
  };

  // ------- RENDER -------
  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      {/* Business Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 mx-auto flex items-center justify-center mb-4 p-3 shadow-xs overflow-hidden">
          {logoUrl ? (
            <Image src={logoUrl} alt={businessName} width={64} height={64} unoptimized className="w-full h-full object-contain" />
          ) : (
            <Image src="/google-maps.svg" alt="Google Maps" width={48} height={48} className="w-full h-full object-contain" />
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {businessName}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {wifiEnabled
            ? 'Beri ulasan di Google Maps untuk membuka akses Wi-Fi gratis.'
            : 'Selamat datang! Berikan ulasan pengalaman Anda di Google Maps.'}
        </p>

        {/* Stage: RATING */}
        {stage === STAGE.RATING && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-800 mb-2">Bagaimana Pengalaman Anda?</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleStarClick(star)}
                    title={`${star} Bintang`}
                    className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-400 h-4 mb-4">
              {(hoverRating || selectedRating) === 1 && 'Sangat Kurang'}
              {(hoverRating || selectedRating) === 2 && 'Kurang Puas'}
              {(hoverRating || selectedRating) === 3 && 'Cukup Baik'}
              {(hoverRating || selectedRating) === 4 && 'Puas'}
              {(hoverRating || selectedRating) === 5 && 'Sangat Puas!'}
            </div>

            {wifiEnabled && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                <LockKeyhole className="w-3.5 h-3.5 shrink-0" />
                Beri rating di atas untuk membuka Wi-Fi
              </div>
            )}
          </div>
        )}

        {/* Stage: WAITING_RETURN (Waiting for user to return from Google Maps) */}
        {stage === STAGE.WAITING_RETURN && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ExternalLink className="w-7 h-7 text-brand-600 animate-pulse" />
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Beri Ulasan di Google Maps
            </h3>
            
            <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto leading-relaxed">
              Silakan berikan rating bintang 5 di Google Maps. Saat Anda kembali ke halaman ini, sistem akan memverifikasi ulasan Anda.
            </p>

            <button
              type="button"
              onClick={() => startPlaceboLoading('maps')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Saya Sudah Memberi Bintang 5</span>
            </button>

            <div className="mt-3.5">
              <button
                type="button"
                onClick={() => {
                  window.open(targetMapsUrl, '_blank', 'noopener,noreferrer');
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-brand-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Buka ulang Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}


        {/* Stage: PLACEBO_LOADING (Fake loading wait) */}
        {stage === STAGE.PLACEBO_LOADING && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center py-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">{loadingText}</h3>
            <p className="text-[11px] text-slate-500 mb-4">Mohon jangan tutup halaman ini.</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">{loadingProgress}%</div>
          </div>
        )}

        {/* Stage: REDIRECTED (Returned from 3-5 star Google Maps or submitted 1-2 star feedback) */}
        {stage === STAGE.REDIRECTED && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {selectedRating <= 2 ? 'Masukan Anda Telah Diterima' : 'Terima kasih atas ulasan Anda!'}
            </p>
            
            {wifiEnabled ? (
              <>
                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                  {selectedRating <= 2
                    ? 'Terima kasih telah membantu kami meningkatkan kualitas layanan. Silakan nikmati akses Wi-Fi di tempat kami.'
                    : 'Klik tombol di bawah untuk melihat nama dan password Wi-Fi.'}
                </p>
                <button
                  type="button"
                  onClick={handleRevealWifi}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UnlockKeyhole className="w-4 h-4" />
                  <span>Lihat Nama &amp; Password Wi-Fi</span>
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {selectedRating <= 2
                  ? 'Masukan Anda telah diteruskan langsung ke pihak pengelola untuk evaluasi layanan. Terima kasih atas perhatian Anda.'
                  : 'Masukan dan ulasan Anda sangat berharga bagi kami.'}
              </p>
            )}
          </div>
        )}

        {/* Stage: DONE (Completed rating) */}
        {stage === STAGE.DONE && !wifiEnabled && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Terima kasih!</p>
            <p className="text-xs text-slate-500 mt-1">
              {selectedRating <= 2
                ? 'Masukan Anda sangat berarti untuk meningkatkan kualitas layanan kami.'
                : 'Ulasan Anda sangat berarti untuk meningkatkan kualitas layanan kami.'}
            </p>
          </div>
        )}
      </div>

      {/* WiFi Section: ONLY shown when wifiEnabled AND wifi was earned */}
      {wifiEnabled && wifiEarned && stage === STAGE.DONE && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl shadow-emerald-100/50 p-6 sm:p-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UnlockKeyhole className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Wi-Fi Terbuka!</h2>
              <p className="text-[11px] text-emerald-600 font-medium">Akses internet untuk pelanggan</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Nama Wi-Fi (SSID)</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{revealedSsid || wifiName || 'Wi-Fi Tamu'}</div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-400">Password Wi-Fi</div>
                <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider mt-0.5">
                  {isRevealingWifi ? (
                    <span className="text-xs text-slate-400 animate-pulse font-normal">Mengambil akses Wi-Fi...</span>
                  ) : (
                    (revealedPassword || wifiPassword) || '(tidak ada password)'
                  )}
                </div>
              </div>

              {(revealedPassword || wifiPassword) && !isRevealingWifi && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Password</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
