'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle2,
  ExternalLink, Wifi, WifiOff, Building2, Star, AlertCircle,
  KeyRound, User, Info, Plus, Check
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedBusinessName, setSavedBusinessName] = useState('');

  // Account fields
  const [waVal, setWaVal] = useState('');
  const [pinVal, setPinVal] = useState('');
  const [confirmPinVal, setConfirmPinVal] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [waCheckResult, setWaCheckResult] = useState(null); // null | {registered: bool}
  const [isCheckingWa, setIsCheckingWa] = useState(false);
  const [createdOwnerId, setCreatedOwnerId] = useState(existingOwnerId);

  // Business fields
  const [targetBusinessId, setTargetBusinessId] = useState(
    businesses.length > 0 ? businesses[0].id : 'new'
  );
  
  const [businessNameVal, setBusinessNameVal] = useState(initialBusiness?.businessName || '');
  const [codeVal, setCodeVal] = useState(initialCode || '');
  const [mapsUrlVal, setMapsUrlVal] = useState(initialBusiness?.googleMapsReviewUrl || initialBusiness?.googleMapsUrl || '');
  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(initialBusiness?.wifiEnabled));
  const [wifiNameVal, setWifiNameVal] = useState(initialBusiness?.wifiName || '');
  const [wifiPasswordVal, setWifiPasswordVal] = useState(initialBusiness?.wifiPassword || '');
  const [whatsappBusinessVal, setWhatsappBusinessVal] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generateSuccess, setGenerateSuccess] = useState(false);

  // Check WA registration on blur
  const handleWaBlur = async () => {
    const wa = waVal.trim();
    if (!wa || wa.length < 8) return;
    setIsCheckingWa(true);
    const result = await checkWaRegisteredAction(wa);
    setWaCheckResult(result);
    setIsCheckingWa(false);
  };

  const handleGenerateReviewLink = async () => {
    if (!mapsUrlVal) {
      setGenerateError('Masukkan link Google Maps terlebih dahulu.');
      return;
    }
    setGenerateError('');
    setIsGeneratingLink(true);
    try {
      const { generateReviewLinkAction } = await import('@/lib/actions/maps-actions');
      const res = await generateReviewLinkAction(mapsUrlVal);
      if (res.success) {
        setMapsUrlVal(res.result);
        setGenerateSuccess(true);
      } else {
        setGenerateError(res.error);
        setGenerateSuccess(false);
      }
    } catch (e) {
      setGenerateError('Gagal memproses link.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleUnifiedSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetCode = (codeVal || initialCode || '').trim().toUpperCase();
    if (!targetCode) {
      setErrorMessage('Kode Cobascan wajib diisi.');
      return;
    }

    if (targetBusinessId === 'new') {
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
      if (isWifiEnabled && (!wifiPasswordVal || wifiPasswordVal.trim().length < 4)) {
        setErrorMessage('Sandi Wi-Fi minimal 4 karakter jika fitur Wi-Fi aktif.');
        return;
      }
    }

    if (!existingOwnerId) {
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
    }

    setIsSubmitting(true);

    if (!existingOwnerId) {
      const regResult = await ownerRegisterAction({
        whatsapp: waVal.trim(),
        pin: pinVal,
        name: nameVal.trim(),
      });

      if (!regResult?.success) {
        setIsSubmitting(false);
        setErrorMessage(regResult?.waAlreadyRegistered ? 'Nomor WA sudah terdaftar.' : (regResult?.error || 'Gagal membuat akun.'));
        return;
      }
      setCreatedOwnerId(regResult.userId);
    }

    const formData = new FormData();
    formData.set('code', targetCode);
    formData.set('targetBusinessId', targetBusinessId);

    if (targetBusinessId === 'new') {
      formData.set('businessName', businessNameVal.trim());
      formData.set('googleMapsReviewUrl', mapsUrlVal.trim());
      formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');
      formData.set('wifiName', wifiNameVal.trim());
      formData.set('wifiPassword', wifiPasswordVal.trim());
      formData.set('isNewBusiness', 'true');
    } else {
      // Find the name of the selected business to display in success screen
      const selectedBiz = businesses.find(b => b.id === targetBusinessId);
      if (selectedBiz) setBusinessNameVal(selectedBiz.businessName);
    }

    let cleanWa = (whatsappBusinessVal || waVal || '').replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
    else if (cleanWa && !cleanWa.startsWith('62')) cleanWa = '62' + cleanWa;
    formData.set('whatsappNumber', cleanWa);

    const result = await activateQrAction(null, formData);

    if (result?.success) {
      setSavedBusinessName(businessNameVal.trim());
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Otomatis pindah ke dashboard setelah 2.5 detik
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2500);
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
          <a href="/dashboard" className="w-full block">
            <button className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors">
              Buka Dashboard Sekarang
            </button>
          </a>
        </div>
      </div>
    );
  }

  // WA ALREADY REGISTERED STATE
  if (waCheckResult?.registered) {
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
          <Link href={`/login?next=/activate/${initialCode}`} className="w-full block">
            <button className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2">
              Lanjut Login untuk Aktivasi
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7">
        <h2 className="text-lg font-black text-slate-900 mb-1">Aktivasi Perangkat</h2>
        <p className="text-xs text-slate-500 mb-5">
          {existingOwnerId 
            ? 'Isi formulir ini untuk membuat profil cabang/toko baru, atau kembali ke Dashboard jika ingin menambahkan perangkat ini ke toko yang sudah ada.' 
            : 'Buat akun dan isi informasi bisnis Anda dalam satu langkah.'}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {existingOwnerId && (
          <div className="mb-6 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              Anda masuk sebagai: <span className="font-bold text-slate-900">{userEmail || 'Owner'}</span>
            </span>
            <button 
              type="button"
              onClick={() => router.push('/api/auth/logout')} 
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
            >
              Ganti Akun / Logout
            </button>
          </div>
        )}

        <form onSubmit={handleUnifiedSubmit} className="space-y-8">
          
          {/* Bagian Akun */}
          {!existingOwnerId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="font-bold text-slate-800">Akun Pengelola</h3>
              </div>
              
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
                  <button 
                    type="button" 
                    onClick={() => setShowPin((s) => !s)} 
                    className="absolute right-2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
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
            </div>
          )}

          {/* Bagian Bisnis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{existingOwnerId ? '1' : '2'}</div>
              <h3 className="font-bold text-slate-800">Informasi Bisnis</h3>
            </div>

            {/* Kode Cobascan */}
            {!initialCode && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Kode Cobascan <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none"><KeyRound className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={codeVal}
                    onChange={(e) => setCodeVal(e.target.value.toUpperCase())}
                    placeholder="Contoh: CS-A1B2C"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Kode yang tertera di bawah QR pada akrilik meja Anda.</p>
              </div>
            )}

            {/* Jika sudah punya akun DAN profil bisnis, arahkan ke Dashboard untuk tambah perangkat */}
            {existingOwnerId && businesses.length > 0 ? (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Anda sudah terdaftar</h3>
                <p className="text-xs text-slate-600">
                  Akun Anda sudah memiliki profil bisnis. Untuk menambahkan perangkat ini, silakan masuk ke Dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold mt-2"
                >
                  Ke Dashboard & Tambah Perangkat
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex items-center flex-1">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Star className="w-4 h-4" /></div>
                      <input
                        type="url"
                        value={mapsUrlVal}
                        onChange={(e) => {
                          setMapsUrlVal(e.target.value);
                          setGenerateSuccess(false);
                        }}
                        placeholder="https://g.page/r/..."
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateReviewLink}
                      disabled={isGeneratingLink || !mapsUrlVal}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                    >
                      {isGeneratingLink ? 'Memproses...' : '🔍 Generate Review Link'}
                    </button>
                  </div>
                  {generateError && <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {generateError}</p>}
                  {generateSuccess && !generateError && (
                    <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Berhasil diproses jadi link Review!
                    </p>
                  )}
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
                          {isWifiEnabled ? 'Aktif: Pelanggan beri rating dulu' : 'Nonaktif: Langsung ke Google Review'}
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
                          Sandi Wi-Fi <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3.5 text-slate-400 pointer-events-none"><KeyRound className="w-4 h-4" /></div>
                          <input
                            type="text"
                            value={wifiPasswordVal}
                            onChange={(e) => setWifiPasswordVal(e.target.value)}
                            placeholder="PasswordWifi123"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hidden field for business context since it's always new now */}
          <input type="hidden" name="targetBusinessId" value="new" />
          <input type="hidden" name="isNewBusiness" value="true" />

          {!existingOwnerId && (
            <button
              type="submit"
              disabled={isSubmitting || waCheckResult?.registered}
              className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mengaktifkan...</>
              ) : (
                <>Aktifkan Perangkat <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
