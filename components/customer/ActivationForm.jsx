'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  Lock,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import { activateQrAction } from '@/lib/actions/qr-actions';

export default function ActivationForm({
  code: initialCode = '',
  initialBusiness = null,
  businesses = [],
  userEmail = '',
  batchCode = '',
}) {
  const router = useRouter();
  const [activationCodeVal, setActivationCodeVal] = useState(initialCode || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedBusinessName, setSavedBusinessName] = useState('');

  const storeList = useMemo(() => {
    if (businesses && businesses.length > 0) return businesses;
    if (initialBusiness) return [initialBusiness];
    return [];
  }, [businesses, initialBusiness]);

  const [selectedStoreId, setSelectedStoreId] = useState(
    storeList.length > 0 ? storeList[0].id : 'new'
  );

  const [businessNameVal, setBusinessNameVal] = useState(storeList[0]?.businessName || '');
  const [mapsUrlVal, setMapsUrlVal] = useState(
    storeList[0]?.googleMapsReviewUrl || storeList[0]?.googleMapsUrl || ''
  );
  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(storeList[0]?.wifiEnabled));
  const [wifiNameVal, setWifiNameVal] = useState(storeList[0]?.wifiName || '');
  const [wifiPasswordVal, setWifiPasswordVal] = useState(storeList[0]?.wifiPassword || '');
  const [whatsappVal, setWhatsappVal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCode = (activationCodeVal || initialCode || '').trim().toUpperCase();
    if (!finalCode) {
      setErrorMessage('Silakan masukkan Kode Aktivasi perangkat.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('code', finalCode);
    formData.set('businessName', businessNameVal);
    formData.set('googleMapsReviewUrl', mapsUrlVal);
    formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');
    formData.set('wifiName', wifiNameVal);
    let cleanWhatsapp = (whatsappVal || '').replace(/[^0-9]/g, '');
    if (cleanWhatsapp.startsWith('0')) {
      cleanWhatsapp = '62' + cleanWhatsapp.substring(1);
    } else if (cleanWhatsapp && !cleanWhatsapp.startsWith('62')) {
      cleanWhatsapp = '62' + cleanWhatsapp;
    }
    formData.set('whatsappNumber', cleanWhatsapp);
    formData.set('targetBusinessId', selectedStoreId);
    formData.set('isNewBusiness', selectedStoreId === 'new' ? 'true' : 'false');

    const result = await activateQrAction(null, formData);

    if (result?.success) {
      setSavedBusinessName(businessNameVal);
      setIsSuccess(true);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result?.error || 'Gagal mengaktifkan Cobascan');
      if (result?.errors) {
        setFieldErrors(result.errors);
      }
    }
  };

  if (isSuccess) {
    const finalCode = (activationCodeVal || initialCode).trim().toUpperCase();
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Aktivasi Berhasil!</h3>
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          Stand Cobascan <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{finalCode}</span> kini telah aktif dan terhubung ke profil ulasan Google Maps{' '}
          <strong className="text-slate-900">{savedBusinessName}</strong>.
        </p>

        {batchCode && (
          <div className="mb-5 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 max-w-sm mx-auto">
            ✨ Seluruh perangkat dalam <strong>Paket {batchCode}</strong> telah otomatis terdaftar dan aktif.
          </div>
        )}

        <div className="flex justify-center my-4">
          <QRCodeViewer
            code={finalCode}
            subtitle={savedBusinessName}
            size={220}
            showActions={true}
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <Link href="/dashboard" className="w-full sm:flex-1">
            <button className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors">
              Ke Dashboard Bisnis
            </button>
          </Link>
          <a
            href={`/q/${finalCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1"
          >
            <button className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] font-bold text-xs text-white shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-1.5 transition-all">
              <span>Tes Scan / Tap Meja</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Bar matching Image 1 */}
      <header className="flex items-center justify-between py-6 px-2 mb-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 relative mix-blend-multiply group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-xl text-slate-900">cobascan</span>
        </Link>

        <a
          href="https://wa.me/6281234567890?text=Halo%20Admin%20Cobascan%2C%20saya%20butuh%20bantuan%20aktivasi%20stand"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Bantuan</span>
        </a>
      </header>

      {/* Main Activation Card matching Image 1 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Aktivasi Cobascan
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Masukkan informasi berikut untuk mulai menggunakan Cobascan Anda.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Kode Aktivasi */}
          <div>
            <label htmlFor="activationCodeInput" className="block text-xs font-bold text-slate-800 mb-1.5">
              Kode Aktivasi <span className="text-rose-500">*</span>
            </label>
            <input
              id="activationCodeInput"
              name="code"
              type="text"
              required
              value={activationCodeVal}
              onChange={(e) => setActivationCodeVal(e.target.value.toUpperCase())}
              placeholder="Contoh: CS-99214A"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent font-mono transition-all bg-white"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Kode aktivasi terdapat pada stiker atau kartu dalam kemasan.
            </p>
          </div>

          {/* Field 2: Nama Bisnis */}
          <div>
            <label htmlFor="businessNameInput" className="block text-xs font-bold text-slate-800 mb-1.5">
              Nama Bisnis <span className="text-rose-500">*</span>
            </label>
            <input
              id="businessNameInput"
              name="businessName"
              type="text"
              required
              value={businessNameVal}
              onChange={(e) => setBusinessNameVal(e.target.value)}
              placeholder="Contoh: Kopi Kenangan"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all bg-white"
            />
          </div>

          {/* Field 3: Link Google Maps / Review */}
          <div>
            <label htmlFor="mapsUrlInput" className="block text-xs font-bold text-slate-800 mb-1.5">
              Link Google Maps / Review <span className="text-rose-500">*</span>
            </label>
            <input
              id="mapsUrlInput"
              name="googleMapsReviewUrl"
              type="url"
              required
              value={mapsUrlVal}
              onChange={(e) => setMapsUrlVal(e.target.value)}
              placeholder="Contoh: https://g.page/xxxxxxxxx/review"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all bg-white"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Link ini akan langsung terbuka saat pengunjung scan atau tap.
            </p>
          </div>

          {/* Field 4: Pakai Wi-Fi untuk pengunjung? (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Pakai Wi-Fi untuk pengunjung? <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            
            {/* Pill Switch Buttons [ Ya ] [ Tidak ] */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWifiEnabled(true)}
                className={`px-7 py-2.5 rounded-full font-bold text-xs transition-all ${
                  isWifiEnabled
                    ? 'bg-[#1A73E8] text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => setIsWifiEnabled(false)}
                className={`px-7 py-2.5 rounded-full font-bold text-xs transition-all ${
                  !isWifiEnabled
                    ? 'bg-[#1A73E8] text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tidak
              </button>
            </div>

            {/* Revealed Wi-Fi input container when Ya is active */}
            {isWifiEnabled && (
              <div className="mt-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4 transition-all">
                <div>
                  <label htmlFor="wifiNameInput" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nama Wi-Fi (SSID)
                  </label>
                  <input
                    id="wifiNameInput"
                    name="wifiName"
                    type="text"
                    value={wifiNameVal}
                    onChange={(e) => setWifiNameVal(e.target.value)}
                    placeholder="Contoh: KopiSenja_Guest"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-white transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="wifiPasswordInput" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Password Wi-Fi
                  </label>
                  <input
                    id="wifiPasswordInput"
                    name="wifiPassword"
                    type="text"
                    value={wifiPasswordVal}
                    onChange={(e) => setWifiPasswordVal(e.target.value)}
                    placeholder="Contoh: kopisenja2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Field 5: Nomor WhatsApp Penanggung Jawab (Opsional) */}
          <div>
            <label htmlFor="whatsappInput" className="block text-xs font-bold text-slate-800 mb-1.5">
              Nomor WhatsApp Penanggung Jawab <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#1A73E8] focus-within:border-transparent transition-all bg-white">
              <div className="px-3.5 py-3 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                <span>+62</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <input
                id="whatsappInput"
                name="whatsappNumber"
                type="tel"
                value={whatsappVal}
                onChange={(e) => setWhatsappVal(e.target.value)}
                placeholder="812 3456 7890"
                className="w-full px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Untuk menerima kritik, saran, atau pertanyaan dari pelanggan.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60 pt-3.5 pb-3.5"
          >
            <span>{isSubmitting ? 'Mengaktifkan...' : 'Aktifkan Cobascan'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Footnote */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Anda aman dan hanya digunakan untuk keperluan layanan Cobascan.</span>
        </div>
      </div>
    </div>
  );
}
