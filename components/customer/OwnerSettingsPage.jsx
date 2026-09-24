'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Star,
  Phone,
  Wifi,
  KeyRound,
  Check,
  LogOut,
  Save,
  AlertCircle,
  WifiOff,
  Settings,
  Layers,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { updateBusinessWifiAction } from '@/lib/actions/business-actions';
import { createClient } from '@/lib/supabase/client';
import DeviceList from './DeviceList';

function Field({ label, helperText, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
      {children}
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 leading-relaxed">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

function TextInput({ name, type = 'text', defaultValue, placeholder, required, icon: Icon }) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-3.5 flex items-center text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        required={required}
        className={`w-full py-2.5 pr-4 ${Icon ? 'pl-10' : 'pl-4'} rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors`}
      />
    </div>
  );
}

export default function OwnerSettingsPage({ business, businesses = [], userEmail, userName, qrList = [] }) {
  const router = useRouter();

  const initialStores = businesses.length > 0 ? businesses : (business ? [business] : []);
  const [stores, setStores] = useState(initialStores);
  const [selectedId, setSelectedId] = useState(business?.id || initialStores[0]?.id || '');
  const activeStore = stores.find((s) => s.id === selectedId) || stores[0] || null;

  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(activeStore?.wifiEnabled));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleStoreChange = (id) => {
    setSelectedId(id);
    const s = stores.find((s) => s.id === id);
    setIsWifiEnabled(Boolean(s?.wifiEnabled));
    setStatusMsg(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');
    formData.set('businessId', activeStore.id);

    const result = await updateBusinessWifiAction(null, formData);
    setIsSubmitting(false);

    if (result?.success) {
      setStatusMsg({ type: 'success', text: 'Pengaturan berhasil disimpan.' });
      setStores((prev) =>
        prev.map((s) =>
          s.id === activeStore.id
            ? {
                ...s,
                businessName: formData.get('businessName') || s.businessName,
                googleMapsReviewUrl: formData.get('googleMapsReviewUrl') || s.googleMapsReviewUrl,
                whatsappNumber: formData.get('whatsappNumber') || s.whatsappNumber,
                wifiEnabled: isWifiEnabled,
                wifiName: formData.get('wifiName') || s.wifiName,
                wifiPassword: formData.get('wifiPassword') || s.wifiPassword,
              }
            : s
        )
      );
      router.refresh();
    } else {
      setStatusMsg({ type: 'error', text: result?.error || 'Gagal menyimpan. Coba lagi.' });
      if (result?.errors) setFieldErrors(result.errors);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    } catch {}
    document.cookie = 'smartwifi_session=; Max-Age=0; path=/';
    router.push('/login');
  };

  if (!activeStore) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-slate-500">Bisnis belum terdaftar. Scan QR perangkat Cobascan Anda untuk memulai.</p>
      </div>
    );
  }

  const filteredQrList = qrList.filter(q => q.businessId === activeStore.id);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center relative">
              <Image src="/cobascan-logo.png" alt="Cobascan" width={32} height={32} className="w-full h-full object-contain" priority />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none pt-0.5">Cobascan</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-medium">— {userEmail}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Branch switcher */}
        {stores.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Pilih Cabang</p>
            <div className="flex flex-wrap gap-2">
              {stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStoreChange(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    s.id === selectedId
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {s.businessName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Pengaturan Default</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Berlaku untuk semua perangkat kecuali diatur khusus per perangkat.</p>
          </div>

          <form key={activeStore.id} onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Status message */}
            {statusMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {statusMsg.type === 'success'
                  ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                {statusMsg.text}
              </div>
            )}

            <input type="hidden" name="businessId" value={activeStore.id} />

            <Field label="Nama Bisnis" error={fieldErrors.businessName}>
              <TextInput
                name="businessName"
                defaultValue={activeStore.businessName}
                placeholder="Kopi Senja"
                required
                icon={Building2}
              />
            </Field>

            <Field label="Link Google Review" error={fieldErrors.googleMapsReviewUrl}>
              <TextInput
                name="googleMapsReviewUrl"
                type="url"
                defaultValue={activeStore.googleMapsReviewUrl || activeStore.googleMapsUrl}
                placeholder="https://g.page/r/..."
                required
                icon={Star}
              />
            </Field>

            <Field label="Nomor WhatsApp" helperText="Menerima keluhan rating 1–2 bintang. Format: 08xx atau 628xx.">
              <TextInput
                name="whatsappNumber"
                type="tel"
                defaultValue={activeStore.whatsappNumber}
                placeholder="081234567890"
                icon={Phone}
              />
            </Field>

            {/* Wi-Fi Toggle */}
            <div className="border-t border-slate-100 pt-4">
              <input type="hidden" name="wifiEnabled" value={isWifiEnabled.toString()} />
              <button
                type="button"
                onClick={() => setIsWifiEnabled((prev) => !prev)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isWifiEnabled
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWifiEnabled ? 'bg-white/20' : 'bg-slate-200'}`}>
                    {isWifiEnabled
                      ? <Wifi className="w-4 h-4 text-white" />
                      : <WifiOff className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${isWifiEnabled ? 'text-white' : 'text-slate-800'}`}>Fitur Wi-Fi</div>
                    <div className={`text-[11px] ${isWifiEnabled ? 'text-white/70' : 'text-slate-400'}`}>
                      {isWifiEnabled ? 'Aktif — Pelanggan beri rating dulu' : 'Nonaktif — Langsung ke Google Review'}
                    </div>
                  </div>
                </div>
                <div className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${isWifiEnabled ? 'bg-white/30' : 'bg-slate-300'}`}
                  style={{ height: '22px', minWidth: '40px' }}>
                  <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${isWifiEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                    style={{ width: '18px', height: '18px' }} />
                </div>
              </button>

              {isWifiEnabled && (
                <div className="mt-3 space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Field label="Nama Wi-Fi (SSID)" error={fieldErrors.wifiName}>
                    <TextInput
                      name="wifiName"
                      defaultValue={activeStore.wifiName}
                      placeholder="NamaWifi_Guest"
                      required={isWifiEnabled}
                      icon={Wifi}
                    />
                  </Field>
                  <Field label="Password Wi-Fi" error={fieldErrors.wifiPassword}>
                    <TextInput
                      name="wifiPassword"
                      defaultValue={activeStore.wifiPassword}
                      placeholder="PasswordWifi123"
                      required={isWifiEnabled}
                      icon={KeyRound}
                    />
                  </Field>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Devices Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Perangkat ({filteredQrList.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Klik <strong>Atur</strong> untuk setting nama lokasi, Wi-Fi, dan link Maps per perangkat.</p>
            </div>
          </div>
          <DeviceList
            qrList={filteredQrList}
            businessName={activeStore.businessName}
            defaultWifiEnabled={activeStore.wifiEnabled}
          />
        </div>

      </div>
    </div>
  );
}
