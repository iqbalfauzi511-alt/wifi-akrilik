'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Wifi,
  Star,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { submitCustomerFeedbackAction } from '@/lib/actions/feedback-actions';

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
  const [copied, setCopied] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // 1-2 star feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const targetMapsUrl = googleMapsReviewUrl || googleMapsUrl || 'https://maps.google.com/';

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!wifiPassword) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(wifiPassword).catch(() => {
        fallbackCopy(wifiPassword);
      });
    } else {
      fallbackCopy(wifiPassword);
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
    } catch {
      // fallback
    }
  };

  // Handle rating star click
  const handleStarClick = (ratingValue) => {
    setSelectedRating(ratingValue);

    if (ratingValue >= 3) {
      // Rating 3–5: Langsung arahkan ke Google Review / Maps
      window.open(targetMapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Rating 1–2: Masuk ke halaman / form feedback
      setShowFeedbackModal(true);
    }
  };

  // Handle Submit Feedback for 1-2 stars
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      setErrorMessage('Silakan tuliskan alasan atau keluhan Anda.');
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
        customerPhone: customerPhone.trim(),
      });

      setIsSubmittingFeedback(false);

      if (res?.success) {
        setFeedbackSubmitted(true);
        // Buka WhatsApp penanggung jawab dengan pesan otomatis
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        setErrorMessage(res?.error || 'Gagal mengirim masukan.');
      }
    } catch {
      setIsSubmittingFeedback(false);
      setErrorMessage('Terjadi kendala saat mengirim masukan.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-4">
      {/* Brand & Business Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-center">
        {/* Business Logo or Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 mx-auto flex items-center justify-center mb-4 overflow-hidden shadow-xs">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={businessName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="font-extrabold text-[#1A73E8] text-xl">
              {businessName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {businessName}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Selamat datang! Berikan ulasan atau sambungkan Wi-Fi Anda.
        </p>

        {/* Rating 1-5 Section */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 mb-2">
            Bagaimana Pengalaman Anda?
          </div>
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
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 h-4">
            {(hoverRating || selectedRating) === 1 && 'Sangat Kurang'}
            {(hoverRating || selectedRating) === 2 && 'Kurang Puas'}
            {(hoverRating || selectedRating) === 3 && 'Cukup Baik'}
            {(hoverRating || selectedRating) === 4 && 'Puas'}
            {(hoverRating || selectedRating) === 5 && 'Sangat Puas!'}
          </div>

          {/* Tombol Beri Review di Google (Langsung) */}
          <div className="mt-5">
            <a
              href={targetMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Beri Review di Google</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bagian Wi-Fi Gratis: HANYA jika Wi-Fi Aktif */}
      {wifiEnabled && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Wi-Fi Gratis</h2>
              <p className="text-[11px] text-slate-400">Akses internet untuk pelanggan</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Nama Wi-Fi (SSID)</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{wifiName || 'KopiSenja_Guest'}</div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-400">Password Wi-Fi</div>
                <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider mt-0.5">
                  {wifiPassword || '••••••••'}
                </div>
              </div>

              {wifiPassword && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Dialog Feedback Rating 1-2 Bintang */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            {feedbackSubmitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Terima Kasih atas Masukan Anda</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Masukan Anda sangat berharga bagi kami untuk terus berbenah. Jika WhatsApp terbuka, Anda dapat mengirim pesan langsung ke pengelola.
                </p>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Sampaikan Masukan Anda
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rating: {selectedRating} Bintang
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Kami memohon maaf atas ketidaknyamanan yang Anda alami di <strong>{businessName}</strong>. Mohon sampaikan keluhan atau saran Anda agar pengelola dapat segera menindaklanjuti.
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
                      Keluhan atau Alasan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Contoh: Makanan agak lama keluar atau ruangan kurang dingin..."
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Anda <span className="text-slate-400 font-normal">(Opsional)</span>
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
                      onClick={() => setShowFeedbackModal(false)}
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
