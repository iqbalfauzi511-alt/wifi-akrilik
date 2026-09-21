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
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function VisitorScanExperience({
  code,
  businessName,
  instagramUrl,
  wifiName,
  wifiPassword,
}) {
  const [hasFollowed, setHasFollowed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fallback if empty
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

  const handleRevealPassword = () => {
    setHasFollowed(true);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(wifiPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Acrylic-Style Visitor Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon / Business Info */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-7 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner mb-3">
            <Wifi className="w-7 h-7 text-brand-400" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            ☕ {businessName}
          </h2>

          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wi-Fi Khusus Pelanggan</span>
          </div>
        </div>

        {/* Action Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {!hasFollowed ? (
            /* Step 1: Follow Instagram prompt */
            <div className="space-y-5 text-center">
              <div>
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  Follow Instagram kami untuk mendapatkan password Wi-Fi.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung pertumbuhan bisnis lokal favorit Anda 💖
                </p>
              </div>

              {/* Display Instagram handle if available */}
              {displayHandle && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 border border-purple-100 flex items-center justify-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span className="font-bold text-slate-900 text-base">@{displayHandle}</span>
                </div>
              )}

              {/* Direct Anchor Button pointing exactly to business.instagram_url */}
              <a
                href={targetInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl transition-all duration-150 select-none active:scale-[0.98] bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-base py-3.5 px-6 shadow-md shadow-pink-500/20"
              >
                <Instagram className="w-5 h-5" />
                <span>FOLLOW INSTAGRAM</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              {/* Confirmation Step */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-3">Setelah follow Instagram:</p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRevealPassword}
                  className="w-full text-sm font-bold bg-slate-900 hover:bg-slate-800 focus:ring-slate-700 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  SAYA SUDAH FOLLOW
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Password Revealed */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Terima Kasih Telah Follow!</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Akses Wi-Fi Terbuka</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gunakan informasi di bawah untuk menghubungkan perangkat Anda:
                </p>
              </div>

              {/* Wi-Fi Credential Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Nama Jaringan (SSID)
                  </label>
                  <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{wifiName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Password Wi-Fi
                  </label>
                  <div className="mt-1 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-mono text-lg font-extrabold text-slate-900 tracking-wider">
                      {wifiPassword}
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

              {/* Large Copy Button */}
              <Button
                variant={copied ? 'secondary' : 'primary'}
                size="lg"
                onClick={handleCopyPassword}
                className="w-full text-base py-3.5 shadow-md shadow-brand-600/20"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    Password Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Salin Password Wi-Fi
                  </>
                )}
              </Button>

              <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-100 text-left flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Buka pengaturan Wi-Fi di smartphone Anda, pilih jaringan{' '}
                  <strong>{wifiName}</strong>, lalu tempel (paste) password yang sudah disalin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHasFollowed(false)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Kembali ke halaman follow
              </button>
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
