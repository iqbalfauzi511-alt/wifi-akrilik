'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Instagram,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function VisitorScanExperience({
  code,
  businessName,
  instagramUrl,
  wifiName,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [revealedWifiName, setRevealedWifiName] = useState(wifiName || 'Wi-Fi Tamu');
  const [revealedWifiPassword, setRevealedWifiPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Fallback Instagram URL if empty
  const targetInstagramUrl = instagramUrl || 'https://www.instagram.com/';

  // Extract display username if possible for label
  let displayHandle = '';
  try {
    const parsed = new URL(targetInstagramUrl);
    const segs = parsed.pathname.split('/').filter(Boolean);
    if (segs.length > 0) {
      displayHandle = segs[0];
    }
  } catch {
    displayHandle = '';
  }

  // Handle "Saya Sudah Follow" button click
  const handleSayaSudahFollow = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await fetch(`/api/q/${encodeURIComponent(code)}/reveal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success) {
        const errorText =
          data?.error ||
          'Maaf, password Wi-Fi belum bisa ditampilkan. Silakan coba lagi.';
        setErrorMessage(errorText);
        setIsLoading(false);
        return;
      }

      setRevealedWifiName(data.wifi_name || wifiName || 'Wi-Fi Tamu');
      setRevealedWifiPassword(data.wifi_password || '');
      setIsRevealed(true);
    } catch (err) {
      setErrorMessage('Maaf, password Wi-Fi belum bisa ditampilkan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Copy Password
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
      console.warn('Fallback copy failed:', e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Acrylic-Style Visitor Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon / Business Info */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-5 sm:p-7 text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner mb-2.5">
            <Wifi className="w-6 h-6 sm:w-7 sm:h-7 text-brand-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase break-words px-2">
            ☕ {businessName}
          </h2>

          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] sm:text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Wi-Fi Khusus Pelanggan</span>
          </div>
        </div>

        {/* Action Content */}
        <div className="p-4 sm:p-7 space-y-5 sm:space-y-6">
          {!isRevealed ? (
            /* STEP 1 & 2: Follow Instagram & Self-Confirmation */
            <div className="space-y-5 text-center">
              {/* Instructions */}
              <div>
                <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                  📸 Follow Instagram kami
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  untuk mendapatkan password Wi-Fi.
                </p>
              </div>

              {/* Display Instagram handle badge if available */}
              {displayHandle && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 border border-purple-100 flex items-center justify-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="font-bold text-slate-900 text-sm">@{displayHandle}</span>
                </div>
              )}

              {/* Button: Follow Instagram */}
              <a
                href={targetInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 font-bold rounded-xl transition-all duration-150 select-none active:scale-[0.98] bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-base py-3.5 px-6 shadow-md shadow-pink-500/20"
              >
                <Instagram className="w-5 h-5" />
                <span>Follow Instagram</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              {/* Error Message if reveal fails */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 text-left animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Confirmation Step: Saya Sudah Follow */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-3">Setelah follow Instagram:</p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSayaSudahFollow}
                  disabled={isLoading}
                  className="w-full text-sm font-bold bg-slate-900 hover:bg-slate-800 focus:ring-slate-700 shadow-sm disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memuat password...</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Saya Sudah Follow</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 3: Password Revealed After Follow */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              {/* Success Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Terima kasih sudah follow! 🎉</span>
              </div>

              {/* Wi-Fi Credentials Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-4">
                {/* Wi-Fi Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Wi-Fi
                  </label>
                  <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{revealedWifiName}</span>
                  </div>
                </div>

                {/* Wi-Fi Password */}
                <div className="pt-3 border-t border-slate-200/70">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Password
                  </label>
                  <div className="mt-1 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-mono text-lg font-extrabold text-slate-900 tracking-wider">
                      {revealedWifiPassword}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-600 transition-colors"
                      title="Salin Password"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button: Copy Password */}
              <Button
                variant={copied ? 'secondary' : 'primary'}
                size="lg"
                onClick={handleCopyPassword}
                className="w-full text-base py-3.5 shadow-md shadow-brand-600/20 font-bold"
              >
                {copied ? (
                  <div className="inline-flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>Password Tersalin ✓</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2">
                    <Copy className="w-5 h-5" />
                    <span>Copy Password</span>
                  </div>
                )}
              </Button>

              {/* Mobile connection helper */}
              <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-100 text-left flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Buka pengaturan Wi-Fi di smartphone Anda, pilih jaringan{' '}
                  <strong>{revealedWifiName}</strong>, lalu tempel (paste) password yang sudah disalin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Smart Wi-Fi QR</span>
          <span className="font-mono font-medium">{code}</span>
        </div>
      </div>
    </div>
  );
}
