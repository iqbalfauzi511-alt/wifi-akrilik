'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Wifi,
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
  wifiUsername = '',
  wifiPassword = '',
  whatsappNumber = '',
}) {
  const targetMapsUrl = googleMapsReviewUrl || googleMapsUrl || 'https://maps.google.com/';

  // All visitors start at RATING stage regardless of wifiEnabled
  const [stage, setStage] = useState(STAGE.RATING);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [copiedField, setCopiedField] = useState(null); // 'ssid' | 'username' | 'password' | null

  // True once visitor goes through Google Maps path or 2-tap bypass
  const [wifiEarned, setWifiEarned] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState(wifiPassword || '');
  const [revealedUsername, setRevealedUsername] = useState(wifiUsername || '');
  const [revealedSsid, setRevealedSsid] = useState(wifiName || 'Wi-Fi Tamu');
  const [isRevealingWifi, setIsRevealingWifi] = useState(false);

  const redirectType = 'maps';

  // Placebo loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Memverifikasi...');
  const placeboTimerRef = useRef(null);

  // 2-Tap Bypass & Prompt rating state (NO timer)
  const [isPromptingRating, setIsPromptingRating] = useState(false);
  const [bypassArmed, setBypassArmed] = useState(false);
  const starsContainerRef = useRef(null);

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
        if (data.wifi_username) setRevealedUsername(data.wifi_username);
      }
    } catch (err) {
      console.error('Failed to reveal wifi:', err);
    } finally {
      setIsRevealingWifi(false);
    }
  }, [code, wifiEnabled, revealedPassword]);

  // Direct unlock helper: reveals password immediately and tracks action
  const unlockWifiDirectly = useCallback(() => {
    setBypassArmed(false);
    setIsPromptingRating(false);

    setWifiEarned(true);
    setStage(STAGE.DONE);
    fetchWifiCredentials();
    trackVisitorAction(code, 'buka_wifi_langsung').catch(() => {});
  }, [code, fetchWifiCredentials]);

  const handleWifiButtonClick = useCallback(() => {
    if (!bypassArmed) {
      // --- TAP 1: Nudge rating without timer ---
      setBypassArmed(true);
      setIsPromptingRating(true);

      if (starsContainerRef.current) {
        starsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // --- TAP 2: "Lanjut Buka Sandi" -> reveal Wi-Fi immediately ---
      unlockWifiDirectly();
    }
  }, [bypassArmed, unlockWifiDirectly]);

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

  // Placebo Loading Runner: runs for exactly 2 seconds IN FRONT OF THE USER once they return
  const startPlaceboLoading = useCallback(() => {
    if (placeboTimerRef.current) {
      clearInterval(placeboTimerRef.current);
    }
    setStage(STAGE.PLACEBO_LOADING);
    setLoadingProgress(0);

    const DURATION = 2000; // 2 detik total di depan mata pengguna
    const startTime = Date.now();

    const getStatusText = (progress) => {
      if (wifiEnabled) {
        if (progress < 50) return 'Menyimpan ulasan Anda...';
        return 'Menyiapkan akses Wi-Fi...';
      }
      return 'Menyimpan ulasan Anda...';
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
        if (wifiEnabled) {
          setWifiEarned(true);
          fetchWifiCredentials();
          trackVisitorAction(code, 'lihat_wifi').catch(() => {});
        }
        setStage(STAGE.DONE);
      }
    }, 100);
  }, [wifiEnabled, fetchWifiCredentials, code]);

  // DETECT RETURN: When user returns to tab from Google Maps or WhatsApp, start Placebo Loading!
  useEffect(() => {
    if (stage !== STAGE.WAITING_RETURN) return;

    const handleTabReturn = () => {
      if (document.visibilityState === 'visible') {
        startPlaceboLoading();
      }
    };

    const handleWindowFocus = () => {
      startPlaceboLoading();
    };

    document.addEventListener('visibilitychange', handleTabReturn);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleTabReturn);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [stage, startPlaceboLoading]);

  const handleCopy = (text, field) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField((curr) => (curr === field ? null : curr));
    }, 2200);
    // Track Salin Wi-Fi
    trackVisitorAction(code, `salin_${field}`).catch(() => {});
  };

  // Star click handler — all ratings go to Google Maps
  const handleStarClick = (value) => {
    setBypassArmed(false);
    setIsPromptingRating(false);

    setSelectedRating(value);
    const trackUrl = `/api/q/${encodeURIComponent(code)}/track?action=buka_review&url=${encodeURIComponent(targetMapsUrl)}`;
    window.open(trackUrl, '_blank', 'noopener,noreferrer');
    setStage(STAGE.WAITING_RETURN);
  };

  // Reveal WiFi
  const handleRevealWifi = useCallback(() => {
    setWifiEarned(true);
    setStage(STAGE.DONE);
    fetchWifiCredentials();
    // Track Lihat WiFi
    trackVisitorAction(code, 'lihat_wifi').catch(() => {});
  }, [code, fetchWifiCredentials]);

  // If somehow reached REDIRECTED, auto-reveal WiFi and transition to DONE
  useEffect(() => {
    if (stage === STAGE.REDIRECTED) {
      handleRevealWifi();
    }
  }, [stage, handleRevealWifi]);

  // ------- RENDER -------
  return (
    <div className="max-w-sm sm:max-w-md w-full mx-auto">
      {/* Single Unified Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 px-5 py-6 sm:px-8 sm:py-8 text-center">
        {/* Logo */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200/80 mx-auto flex items-center justify-center mb-3 sm:mb-4 p-2.5 sm:p-3 shadow-xs overflow-hidden">
          {logoUrl ? (
            <Image src={logoUrl} alt={businessName} width={64} height={64} unoptimized className="w-full h-full object-contain" />
          ) : (
            <Image src="/google-maps.svg" alt="Google Maps" width={48} height={48} className="w-full h-full object-contain" />
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words">
          {businessName}
        </h1>

        {/* Stage: RATING */}
        {stage === STAGE.RATING && (
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100">
            {bypassArmed ? (
              <div className="animate-in fade-in duration-200">
                <div className="text-sm font-bold text-amber-800 sm:text-base">
                  Kami Sangat Berharap Dukungan Anda
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-[290px] sm:max-w-xs mx-auto leading-relaxed text-balance">
                  Satu ulasan dari Anda sangat berharga bagi kami
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-slate-800 sm:text-base">
                  Bagaimana pengalaman Anda?
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed text-balance">
                  Yuk, bagikan pengalaman Anda di Google Maps!
                </p>
              </div>
            )}

            <div
              ref={starsContainerRef}
              className={`flex items-center justify-center gap-1 sm:gap-2 mt-3 mb-2 p-2 rounded-2xl transition-all duration-300 ${
                isPromptingRating
                  ? 'ring-2 ring-amber-400 bg-amber-50/90 shadow-md shadow-amber-300/30 scale-[1.02]'
                  : ''
              }`}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => {
                      setHoverRating(star);
                      if (isPromptingRating) setIsPromptingRating(false);
                    }}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleStarClick(star)}
                    title={`${star} Bintang`}
                    aria-label={`Beri ulasan ${star} bintang dari 5`}
                    className="p-1 sm:p-1.5 rounded-xl transition-all hover:scale-120 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] touch-manipulation cursor-pointer"
                  >
                    <Star
                      className={`w-7.5 h-7.5 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 transition-colors ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-400 h-4 mb-1">
              {(hoverRating || selectedRating) === 1 && 'Sangat Kurang'}
              {(hoverRating || selectedRating) === 2 && 'Kurang Puas'}
              {(hoverRating || selectedRating) === 3 && 'Cukup Baik'}
              {(hoverRating || selectedRating) === 4 && 'Puas'}
              {(hoverRating || selectedRating) === 5 && 'Sangat Puas!'}
            </div>

            {/* Wi-Fi Action Area inside the SAME unified card */}
            {wifiEnabled && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-slate-700">
                    <Wifi className="w-4 h-4 text-[#1A73E8]" />
                    <span className="text-xs font-bold text-slate-800">Akses Wi-Fi</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleWifiButtonClick}
                    className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-[0.98] ${
                      bypassArmed
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/25 ring-2 ring-slate-900/10'
                        : 'bg-[#1A73E8] hover:bg-blue-600 text-white shadow-blue-500/20'
                    }`}
                  >
                    {bypassArmed ? (
                      <>
                        <UnlockKeyhole className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Lanjut Buka Sandi</span>
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="w-4 h-4 shrink-0" />
                        <span>Buka Sandi Wi-Fi</span>
                      </>
                    )}
                  </button>

                  {bypassArmed ? (
                    <p className="text-[11px] text-slate-500 leading-snug animate-in fade-in duration-200">
                      Ketuk tombol di atas jika ingin langsung melihat sandi.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Dapatkan nama jaringan dan sandi Wi-Fi di meja ini.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage: WAITING_RETURN (Waiting for user to return from Google Maps) */}
        {stage === STAGE.WAITING_RETURN && (
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ExternalLink className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 animate-pulse" />
            </div>
            
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
              Beri Ulasan di Google Maps
            </h3>
            
            <p className="text-xs text-slate-500 mb-4 sm:mb-5 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed text-balance">
              Silakan berikan ulasan di Google Maps. Saat Anda kembali ke halaman ini, akses Wi-Fi akan langsung terbuka.
            </p>

            <button
              type="button"
              onClick={() => startPlaceboLoading('maps')}
              className="w-full min-h-[46px] py-3 px-4 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Saya Sudah Memberi Ulasan</span>
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
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100 text-center py-4">
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

        {/* Stage: DONE / REDIRECTED with revealed credentials inside the SAME card */}
        {(stage === STAGE.DONE || stage === STAGE.REDIRECTED) && (
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {selectedRating ? 'Terima kasih atas ulasan Anda!' : 'Wi-Fi Terbuka! 🎉'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed text-balance">
                {selectedRating
                  ? 'Masukan dan penilaian Anda sangat berarti bagi kami.'
                  : 'Silakan gunakan akses internet Wi-Fi di bawah ini.'}
              </p>
            </div>

            {/* Credentials area */}
            {wifiEnabled && wifiEarned && (
              <div className="text-left p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                {/* Row 1: SSID (NO COPY BUTTON) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-slate-400">Nama Wi-Fi (SSID)</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">{revealedSsid || wifiName || 'Wi-Fi Tamu'}</div>
                  </div>
                </div>

                {/* Row 2: Username / ID Voucher (ADAPTIVE - only if present) */}
            {Boolean(revealedUsername) && (
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-400">Username / ID Voucher</div>
                  <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider mt-0.5 truncate">
                    {revealedUsername}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(revealedUsername, 'username')}
                  className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                  title="Salin Username Voucher"
                >
                  {copiedField === 'username' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Username</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Row 3: Password */}
            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-slate-400">Password Wi-Fi</div>
                <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider mt-0.5 truncate">
                  {isRevealingWifi ? (
                    <span className="text-xs text-slate-400 animate-pulse font-normal">Mengambil akses Wi-Fi...</span>
                  ) : (
                    (revealedPassword || wifiPassword) || '(tanpa kata sandi)'
                  )}
                </div>
              </div>

              {(revealedPassword || wifiPassword) && !isRevealingWifi && (
                <button
                  type="button"
                  onClick={() => handleCopy(revealedPassword || wifiPassword, 'password')}
                  className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                  title="Salin Password Wi-Fi"
                >
                  {copiedField === 'password' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Tersalin!</span>
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
        )}
      </div>
    )}
  </div>
</div>
);
}
