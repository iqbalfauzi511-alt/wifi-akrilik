'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Smartphone, Download, X, Share, PlusSquare } from 'lucide-react';

const STORAGE_KEY = 'cobascan_pwa_dismissed';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (standaloneMode) {
      setIsStandalone(true);
      return;
    }

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // Ignore localStorage restrictions
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isSafari = ua.includes('safari') && !ua.includes('crios') && !ua.includes('chrome');

    if (isIos && isSafari) {
      setIsIOS(true);
      setIsVisible(true);
    }

    const handleBeforePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide((prev) => !prev);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore
    }
  };

  if (!isVisible || isStandalone || installed) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs p-1.5 overflow-hidden">
            <Image
              src="/icons/icon-192.png"
              alt="Cobascan App Icon"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Akses Cepat di Layar Utama HP
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Pasang Cobascan agar mudah cek scan dan ubah password Wi-Fi langsung tanpa repot buka browser.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          title="Tutup"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isIOS ? (showIosGuide ? 'Tutup Petunjuk' : 'Lihat Cara Pasang di iPhone') : 'Pasang Aplikasi'}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Nanti Saja
        </button>
      </div>

      {isIOS && showIosGuide && (
        <div className="mt-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-800">
            Langkah Pemasangan di Safari iOS:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
            <li className="leading-relaxed">
              Ketuk tombol <strong className="text-slate-800">Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> di bilah bawah Safari.
            </li>
            <li className="leading-relaxed">
              Gulir ke bawah dan pilih <strong className="text-slate-800">Tambahkan ke Layar Utama</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" />.
            </li>
            <li className="leading-relaxed">
              Ketuk <strong className="text-slate-800">Tambah</strong> di pojok kanan atas.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
