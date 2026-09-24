'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Wifi,
  WifiOff,
  Star,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  UnlockKeyhole,
  ArrowRight,
} from 'lucide-react';
import { submitCustomerFeedbackAction } from '@/lib/actions/feedback-actions';

// Stage constants
const STAGE = {
  RATING: 'rating',
  FEEDBACK: 'feedback',
  REDIRECTED: 'redirected', // Opened external URL, waiting for explicit user click
  DONE: 'done',             // Rating complete (and WiFi unlocked if wifiEnabled)
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

  // Feedback form state
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Copy WiFi password
  const handleCopyPassword = () => {
    if (!wifiPassword) return;
    try {
      navigator.clipboard.writeText(wifiPassword);
    } catch {
      const el = document.createElement('textarea');
      el.value = wifiPassword;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Star click handler
  const handleStarClick = (value) => {
    setSelectedRating(value);
    if (value >= 3) {
      // Open Google Maps URL in new tab
      window.open(targetMapsUrl, '_blank', 'noopener,noreferrer');
      // Set to REDIRECTED stage (user must click button when they come back, or if no wifi, complete directly)
      setStage(STAGE.REDIRECTED);
    } else {
      // Show feedback form (1-2 stars)
      setStage(STAGE.FEEDBACK);
    }
  };

  // Submit 1-2 star feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      setErrorMessage('Tuliskan keluhan atau saran Anda.');
      return;
    }
    setIsSubmittingFeedback(true);
    setErrorMessage('');
    try {
      const res = await submitCustomerFeedbackAction({
        qrCode: code,
        rating: selectedRating,
        message: feedbackMessage,
        customerName: customerName.trim(),
        customerPhone: '',
      });
      setIsSubmittingFeedback(false);
      if (res?.success) {
        setFeedbackSubmitted(true);
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        setErrorMessage(res?.error || 'Gagal mengirim masukan.');
      }
    } catch {
      setIsSubmittingFeedback(false);
      setErrorMessage('Terjadi kendala. Silakan coba lagi.');
    }
  };

  // After feedback modal is completed by user clicking button
  const handleFinishFeedback = () => {
    setStage(STAGE.DONE);
  };

  // Explicit click to reveal WiFi (or complete flow)
  const handleRevealWifi = () => {
    setStage(STAGE.DONE);
  };

  // ------- RENDER -------
  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      {/* Business Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 mx-auto flex items-center justify-center mb-4 p-3 shadow-xs">
          <Image src="/google-maps.svg" alt="Google Maps" width={48} height={48} className="w-full h-full object-contain" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {businessName}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {wifiEnabled
            ? 'Beri ulasan untuk membuka akses Wi-Fi gratis.'
            : 'Selamat datang! Berikan ulasan pengalaman Anda.'}
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

        {/* Stage: REDIRECTED (Returned from 3-5 star Google Maps link) */}
        {stage === STAGE.REDIRECTED && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800">Terima kasih atas ulasan Anda!</p>
            
            {wifiEnabled ? (
              <>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Klik tombol di bawah untuk melihat nama dan password Wi-Fi.
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
              <p className="text-xs text-slate-500 mt-1">
                Masukan dan ulasan Anda sangat berharga bagi kami.
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
              Ulasan Anda sangat berarti untuk meningkatkan kualitas layanan kami.
            </p>
          </div>
        )}
      </div>

      {/* WiFi Section — ONLY shown when wifiEnabled AND stage is DONE */}
      {wifiEnabled && stage === STAGE.DONE && (
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
              <div className="text-sm font-bold text-slate-900 mt-0.5">{wifiName || 'Wi-Fi Tamu'}</div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-400">Password Wi-Fi</div>
                <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider mt-0.5">
                  {wifiPassword || '(tidak ada password)'}
                </div>
              </div>

              {wifiPassword && (
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

      {/* Feedback Modal — Rating 1-2 stars */}
      {stage === STAGE.FEEDBACK && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            {feedbackSubmitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Terima Kasih!</h3>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  Masukan Anda telah dikirim. Tim pengelola <strong>{businessName}</strong> akan segera menindaklanjutinya.
                </p>

                {wifiEnabled ? (
                  <button
                    type="button"
                    onClick={handleFinishFeedback}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <UnlockKeyhole className="w-4 h-4" />
                    <span>Lihat Nama &amp; Password Wi-Fi</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishFeedback}
                    className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Selesai
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sampaikan Masukan Anda</h3>
                    <p className="text-xs text-slate-500">Rating: {selectedRating} Bintang</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Kami mohon maaf atas ketidaknyamanan di <strong>{businessName}</strong>. Sampaikan keluhan agar pengelola dapat segera menindaklanjuti.
                </p>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Keluhan atau Saran <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Contoh: Makanan agak lama atau ruangan kurang dingin..."
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-slate-50/50"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setStage(STAGE.RATING); setSelectedRating(0); }}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingFeedback ? (
                        <span>Mengirim...</span>
                      ) : (
                        <>
                          <span>Kirim ke WhatsApp</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
