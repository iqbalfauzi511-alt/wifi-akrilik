'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Star,
  MapPin,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Loader2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function VisitorScanExperience({
  code,
  businessName,
  googleMapsReviewUrl,
  googleMapsUrl,
  wifiEnabled,
  wifiName,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasOpenedReview, setHasOpenedReview] = useState(false);
  const [revealedWifiName, setRevealedWifiName] = useState(wifiName || 'Wi-Fi Tamu');
  const [revealedWifiPassword, setRevealedWifiPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Fallback Google Maps Review URL if empty
  const targetMapsUrl = googleMapsReviewUrl || googleMapsUrl || 'https://maps.google.com/';

  // Handle opening Google Maps review
  const handleOpenReview = () => {
    setHasOpenedReview(true);
    setErrorMessage('');
  };

  // Handle "Saya Sudah Memberikan Rating" button click
  const handleSayaSudahMemberikanRating = async () => {
    if (isLoading) return;

    // Must open and leave review first
    if (!hasOpenedReview) {
      setErrorMessage('Silakan buka dan berikan ulasan di Google Maps terlebih dahulu!');
      if (typeof window !== 'undefined') {
        window.open(targetMapsUrl, '_blank', 'noopener,noreferrer');
      }
      setHasOpenedReview(true);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await fetch(`/api/q/${encodeURIComponent(code)}/reveal-wifi`, {
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
      {/* Main Acrylic & NFC Style Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon / Business Info */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-5 sm:p-7 text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner mb-2.5">
            <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase break-words px-2">
            ☕ {businessName}
          </h2>

          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] sm:text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Cobascan &bull; QR &bull; NFC Tap</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* FITUR 1: GOOGLE MAPS RATING & REVIEW */}
          <div className="space-y-4 text-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-500 mb-1.5">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {wifiEnabled ? 'Langkah 1: Berikan Rating' : 'Bagaimana pengalaman Anda?'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {wifiEnabled
                  ? 'Klik tombol di bawah untuk membuka halaman ulasan Google Maps bisnis kami:'
                  : 'Bantu kami dengan memberikan rating di Google Maps.'}
              </p>
            </div>

            {/* Tombol Beri Rating di Google Maps */}
            <a
              href={targetMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenReview}
              className="w-full inline-flex items-center justify-center gap-2.5 font-bold rounded-xl transition-all duration-150 select-none active:scale-[0.98] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 text-white text-base py-3.5 px-6 shadow-md shadow-blue-500/20"
            >
              <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
              <span>Beri Rating di Google Maps</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>

            {hasOpenedReview && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                <span>Halaman Google Maps telah dibuka. Silakan kembali untuk melihat password!</span>
              </p>
            )}
          </div>

          {/* FITUR 2: WI-FI ACCESS (Hanya tampil jika wifiEnabled === true) */}
          {wifiEnabled && (
            <div className="pt-5 border-t border-slate-200/80">
              {!isRevealed ? (
                /* Sebelum Reveal Password Wi-Fi */
                <div className="space-y-4 text-center animate-in fade-in duration-200">
                  <div className="flex items-center justify-center gap-2 text-slate-800">
                    <Wifi className="w-5 h-5 text-brand-600" />
                    <h3 className="text-base font-bold">Langkah 2: Ambil Password Wi-Fi</h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Setelah membuka/memberikan ulasan, tekan tombol di bawah untuk melihat password Wi-Fi:
                  </p>

                  {/* Error Message if reveal fails */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 text-left animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Tombol: Saya Sudah Memberikan Rating */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSayaSudahMemberikanRating}
                    disabled={isLoading}
                    className="w-full text-sm font-bold bg-slate-900 hover:bg-slate-800 focus:ring-slate-700 shadow-sm disabled:opacity-60 py-3.5"
                  >
                    {isLoading ? (
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Membuka password...</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Saya Sudah Review (Buka Password)</span>
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                /* Setelah Reveal Password Wi-Fi */
                <div className="space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Terima kasih! 🎉</span>
                  </div>

                  {/* Wi-Fi Credential Box */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Nama Wi-Fi:
                      </label>
                      <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>{revealedWifiName}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Password Wi-Fi:
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

                  {/* Copy Button */}
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

                  {/* Helper Instructions */}
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
          )}
        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Cobascan &bull; Scan. Tap. Connect. Review.</span>
          <span className="font-mono font-medium">{code}</span>
        </div>
      </div>
    </div>
  );
}
