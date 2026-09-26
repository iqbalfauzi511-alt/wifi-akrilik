'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle2,
  ExternalLink, Wifi, WifiOff, Building2, Star, AlertCircle,
  KeyRound, User, Info
} from 'lucide-react';
import { ownerRegisterAction, checkWaRegisteredAction } from '@/lib/actions/owner-auth-actions';
import { activateQrAction } from '@/lib/actions/qr-actions';

export default function ActivationForm({
  code: initialCode = '',
  initialBusiness = null,
  businesses = [],
  userEmail = '',
  batchCode = '',
  existingOwnerId = null, // already logged in owner
}) {
  const router = useRouter();
  const [step, setStep] = useState(existingOwnerId ? 'business' : 'account'); // 'account' | 'business' | 'success'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedBusinessName, setSavedBusinessName] = useState('');

  // Account step fields
  const [waVal, setWaVal] = useState('');
  const [pinVal, setPinVal] = useState('');
  const [confirmPinVal, setConfirmPinVal] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [waCheckResult, setWaCheckResult] = useState(null); // null | {registered: bool}
  const [isCheckingWa, setIsCheckingWa] = useState(false);
  const [createdOwnerId, setCreatedOwnerId] = useState(existingOwnerId);

  // Business step fields
  const [businessNameVal, setBusinessNameVal] = useState(initialBusiness?.businessName || '');
  const [mapsUrlVal, setMapsUrlVal] = useState(initialBusiness?.googleMapsReviewUrl || initialBusiness?.googleMapsUrl || '');
  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(initialBusiness?.wifiEnabled));
  const [wifiNameVal, setWifiNameVal] = useState(initialBusiness?.wifiName || '');
  const [wifiPasswordVal, setWifiPasswordVal] = useState(initialBusiness?.wifiPassword || '');
  const [whatsappBusinessVal, setWhatsappBusinessVal] = useState('');

  // Check WA registration on blur
  const handleWaBlur = async () => {
    const wa = waVal.trim();
    if (!wa || wa.length < 8) return;
    setIsCheckingWa(true);
    const result = await checkWaRegisteredAction(wa);
    setWaCheckResult(result);
    setIsCheckingWa(false);
  };

  // Step 1: Account (WA+PIN) or if already logged in, skip
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!waVal.trim() || waVal.trim().length < 8) {
      setErrorMessage('Masukkan nomor WhatsApp yang valid.');
      return;
    }
    if (waCheckResult?.registered) {
      setErrorMessage('Nomor WA ini sudah terdaftar. Silakan login ke dashboard untuk tambah perangkat baru.');
      return;
    }
    if (!pinVal || pinVal.length !== 6) {
      setErrorMessage('PIN harus tepat 6 angka.');
      return;
    }
    if (pinVal !== confirmPinVal) {
      setErrorMessage('Konfirmasi PIN tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    const result = await ownerRegisterAction({
      whatsapp: waVal.trim(),
      pin: pinVal,
      name: nameVal.trim(),
    });

    if (result?.success) {
      setCreatedOwnerId(result.userId);
      setStep('business');
      setIsSubmitting(false);
    } else if (result?.waAlreadyRegistered) {
      setIsSubmitting(false);
      setErrorMessage('Nomor WA sudah terdaftar. Silakan masuk ke dashboard Anda untuk menambah perangkat.');
    } else {
      setIsSubmitting(false);
      setErrorMessage(result?.error || 'Gagal membuat akun.');
    }
  };

  // Step 2: Business info + activate QR
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!businessNameVal.trim()) {
      setErrorMessage('Nama bisnis tidak boleh kosong.');
      return;
    }
    if (!mapsUrlVal.trim()) {
      setErrorMessage('Link Google Review wajib diisi.');
      return;
    }
    if (isWifiEnabled && !wifiNameVal.trim()) {
      setErrorMessage('Nama Wi-Fi (SSID) wajib diisi jika fitur Wi-Fi diaktifkan.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set('code', (initialCode || '').trim().toUpperCase());
    formData.set('businessName', businessNameVal.trim());
    formData.set('googleMapsReviewUrl', mapsUrlVal.trim());
    formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');
    formData.set('wifiName', wifiNameVal.trim());
    formData.set('wifiPassword', wifiPasswordVal.trim());

    let cleanWa = (whatsappBusinessVal || waVal || '').replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
    else if (cleanWa && !cleanWa.startsWith('62')) cleanWa = '62' + cleanWa;
    formData.set('whatsappNumber', cleanWa);
    formData.set('targetBusinessId', 'new');
    formData.set('isNewBusiness', 'true');

    const result = await activateQrAction(null, formData);

    if (result?.success) {
      setSavedBusinessName(businessNameVal.trim());
      setIsSubmitting(false);
      setIsSuccess(true);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result?.error || 'Gagal mengaktifkan Cobascan. Coba lagi.');
    }
  };

  // SUCCESS STATE
  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Cobascan Aktif! 🎉</h2>
        <p className="text-sm text-slate-500 mb-1">
          Perangkat <span className="font-mono font-bold">{initialCode}</span> berhasil terhubung ke{' '}
          <strong className="text-slate-800">{savedBusinessName}</strong>.
        </p>
        {batchCode && (
          <p className="text-xs text-indigo-600 font-semibold mt-1 mb-4">
            📦 Semua perangkat dalam Paket {batchCode} telah aktif.
          </p>
        )}
        <div className="mt-6 space-y-2.5">
          <a href={`/q/${initialCode}`} target="_blank" rel="noopener noreferrer" className="w-full block">
            <button className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] text-white font-bold text-sm flex items-center justify-center gap-2">
              <span>Tes Halaman Scan</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </a>
          <Link href="/dashboard" className="w-full block">
            <button className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors">
              Buka Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // WA ALREADY REGISTERED STATE
  if (waCheckResult?.registered && step === 'account') {
    return (
      <div className="bg-white rounded-3xl border border-amber-200 shadow-xl p-8 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">⚠️ Nomor WA Sudah Terdaftar</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Nomor WhatsApp <strong>{waVal}</strong> sudah memiliki akun Cobascan.
          <br />
          Silakan masuk ke Dashboard untuk mengaktifkan perangkat baru.
        </p>
        <div className="space-y-2">
          <Link href="/login" className="w-full block">
            <button className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2">
              Masuk ke Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => { setWaCheckResult(null); setWaVal(''); }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm"
          >
            Gunakan Nomor WA Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Progress indicator */}
      {!existingOwnerId && (
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === 'account' ? 'text-[#1A73E8]' : 'text-emerald-600'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${step === 'account' ? 'bg-[#1A73E8]' : 'bg-emerald-500'}`}>
              {step === 'account' ? '1' : '✓'}
            </div>
            <span>Akun</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === 'business' ? 'text-[#1A73E8]' : 'text-slate-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${step === 'business' ? 'bg-[#1A73E8]' : 'bg-slate-300'}`}>
              2
            </div>
            <span>Bisnis</span>
          </div>
        </div>
      )}

      {/* STEP 1: Account */}
      {step === 'account' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7">
          <h2 className="text-lg font-black text-slate-900 mb-1">Buat Akun Owner</h2>
          <p className="text-xs text-slate-500 mb-5">Nomor WhatsApp dan PIN digunakan untuk masuk ke dashboard.</p>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAccountSubmit} className="space-y-4">
            {/* Nama (opsional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nama <span className="text-slate-400 normal-case font-normal">(Opsional)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none"><User className="w-4 h-4" /></div>
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  placeholder="Nama pemilik atau nama panggilan"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                />
              </div>
            </div>

            {/* WA */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Phone className="w-4 h-4" /></div>
                <input
                  type="tel"
                  value={waVal}
                  onChange={(e) => { setWaVal(e.target.value); setWaCheckResult(null); }}
                  onBlur={handleWaBlur}
                  placeholder="08123456789"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all ${
                    waCheckResult?.registered ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                  }`}
                />
                {isCheckingWa && (
                  <div className="absolute right-3.5">
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-[#1A73E8] rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {waCheckResult?.registered && (
                <p className="text-xs text-amber-600 font-medium mt-1">⚠️ Nomor ini sudah terdaftar.</p>
              )}
            </div>

            {/* PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Buat PIN 6 Angka <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Lock className="w-4 h-4" /></div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinVal}
                  onChange={(e) => setPinVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] tracking-widest font-mono"
                />
                <button type="button" onClick={() => setShowPin((s) => !s)} className="absolute right-3.5 text-slate-400 hover:text-slate-600">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Konfirmasi PIN <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none"><KeyRound className="w-4 h-4" /></div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={confirmPinVal}
                  onChange={(e) => setConfirmPinVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] tracking-widest font-mono ${
                    confirmPinVal && confirmPinVal !== pinVal ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  }`}
                />
              </div>
              {confirmPinVal && confirmPinVal !== pinVal && (
                <p className="text-xs text-rose-500 font-medium mt-1">PIN tidak cocok.</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>PIN ini digunakan untuk masuk ke dashboard. Simpan baik-baik. Jika lupa, hubungi Admin Cobascan.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || waCheckResult?.registered}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>
              ) : (
                <>Lanjut ke Pengaturan Bisnis <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Business Info */}
      {step === 'business' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7">
          <h2 className="text-lg font-black text-slate-900 mb-1">Pengaturan Bisnis</h2>
          <p className="text-xs text-slate-500 mb-5">Informasi ini akan ditampilkan saat pelanggan scan akrilik Anda.</p>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleBusinessSubmit} className="space-y-4">
            {/* Nama Bisnis */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nama Bisnis <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Building2 className="w-4 h-4" /></div>
                <input
                  type="text"
                  value={businessNameVal}
                  onChange={(e) => setBusinessNameVal(e.target.value)}
                  placeholder="Kopi Senja"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>
            </div>

            {/* Link Google Review */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Link Google Review <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Star className="w-4 h-4" /></div>
                <input
                  type="url"
                  value={mapsUrlVal}
                  onChange={(e) => setMapsUrlVal(e.target.value)}
                  placeholder="https://g.page/r/..."
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>
            </div>

            {/* Wi-Fi Toggle */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsWifiEnabled((v) => !v)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isWifiEnabled ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWifiEnabled ? 'bg-white/20' : 'bg-slate-200'}`}>
                    {isWifiEnabled ? <Wifi className="w-4 h-4 text-white" /> : <WifiOff className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${isWifiEnabled ? 'text-white' : 'text-slate-800'}`}>Fitur Wi-Fi</div>
                    <div className={`text-[11px] ${isWifiEnabled ? 'text-white/70' : 'text-slate-400'}`}>
                      {isWifiEnabled ? 'Aktif — Pelanggan beri rating dulu' : 'Nonaktif — Langsung ke Google Review'}
                    </div>
                  </div>
                </div>
                <div className={`relative rounded-full transition-colors shrink-0 ${isWifiEnabled ? 'bg-white/30' : 'bg-slate-300'}`}
                  style={{ width: '40px', height: '22px' }}>
                  <div className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-transform ${isWifiEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                    style={{ width: '18px', height: '18px' }} />
                </div>
              </button>

              {isWifiEnabled && (
                <div className="mt-3 space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Nama Wi-Fi (SSID) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Wifi className="w-4 h-4" /></div>
                      <input
                        type="text"
                        value={wifiNameVal}
                        onChange={(e) => setWifiNameVal(e.target.value)}
                        placeholder="NamaWifi_Guest"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Sandi Wi-Fi
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none"><KeyRound className="w-4 h-4" /></div>
                      <input
                        type="text"
                        value={wifiPasswordVal}
                        onChange={(e) => setWifiPasswordVal(e.target.value)}
                        placeholder="PasswordWifi123"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengaktifkan...</>
              ) : (
                <>Aktifkan Perangkat <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
