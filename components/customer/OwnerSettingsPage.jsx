'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  Star,
  Phone,
  Wifi,
  KeyRound,
  Check,
  LogOut,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  WifiOff,
} from 'lucide-react';
import { updateBusinessWifiAction } from '@/lib/actions/business-actions';
import { createClient } from '@/lib/supabase/client';
import CustomerQrTable from './CustomerQrTable';

function Field({ label, helperText, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      {children}
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 leading-relaxed">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

function TextInput({ name, type = 'text', defaultValue, placeholder, required, prefix }) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <div className="absolute left-3.5 flex items-center text-slate-400 pointer-events-none">
          {prefix}
        </div>
      )}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        required={required}
        className={`w-full py-3 pr-4 ${prefix ? 'pl-10' : 'pl-4'} rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors`}
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

  // Sync wifi toggle when switching stores
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
    // Clear dev session cookie
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan</h1>
            <p className="text-xs text-slate-500 mt-0.5">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>

        {/* Branch switcher (if multiple stores) */}
        {stores.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Pilih Cabang</p>
            <div className="flex flex-wrap gap-2">
              {stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStoreChange(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    s.id === selectedId
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s.businessName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Settings Form */}
        <form
          key={activeStore.id}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5"
        >
          {/* Status message */}
          {statusMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMsg.type === 'success'
                ? <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {statusMsg.text}
            </div>
          )}

          <input type="hidden" name="businessId" value={activeStore.id} />

          {/* Business Name */}
          <Field
            label="Nama Bisnis"
            error={fieldErrors.businessName}
            helperText="Nama yang tampil saat pelanggan scan QR."
          >
            <TextInput
              name="businessName"
              defaultValue={activeStore.businessName}
              placeholder="Kopi Senja"
              required
              prefix={<Building className="w-4 h-4" />}
            />
          </Field>

          {/* Google Review URL */}
          <Field
            label="Link Google Review"
            error={fieldErrors.googleMapsReviewUrl}
            helperText="URL halaman ulasan Google Maps bisnis Anda."
          >
            <TextInput
              name="googleMapsReviewUrl"
              type="url"
              defaultValue={activeStore.googleMapsReviewUrl || activeStore.googleMapsUrl}
              placeholder="https://g.page/r/..."
              required
              prefix={<Star className="w-4 h-4 text-amber-500" />}
            />
          </Field>

          {/* WhatsApp Number */}
          <Field
            label="Nomor WhatsApp"
            helperText="Menerima keluhan pelanggan yang memberi rating 1–2 bintang. Format: 08xx atau 628xx."
          >
            <TextInput
              name="whatsappNumber"
              type="tel"
              defaultValue={activeStore.whatsappNumber}
              placeholder="081234567890"
              prefix={<Phone className="w-4 h-4" />}
            />
          </Field>

          {/* Wi-Fi Toggle */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWifiEnabled((prev) => !prev)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                isWifiEnabled
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isWifiEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isWifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900">Fitur Wi-Fi</div>
                  <div className={`text-[11px] font-medium ${isWifiEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isWifiEnabled ? 'Aktif — Pelanggan perlu beri rating dulu' : 'Nonaktif — Langsung ke Google Review'}
                  </div>
                </div>
              </div>
              {/* Toggle pill */}
              <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isWifiEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isWifiEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Wi-Fi Credentials (conditional) */}
          {isWifiEnabled && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-blue-600" />
                Kredensial Wi-Fi
              </p>

              <Field label="Nama Wi-Fi (SSID)" error={fieldErrors.wifiName}>
                <TextInput
                  name="wifiName"
                  defaultValue={activeStore.wifiName}
                  placeholder="NamaWifi_Guest"
                  required={isWifiEnabled}
                  prefix={<Wifi className="w-4 h-4" />}
                />
              </Field>

              <Field label="Password Wi-Fi" error={fieldErrors.wifiPassword}>
                <TextInput
                  name="wifiPassword"
                  defaultValue={activeStore.wifiPassword}
                  placeholder="PasswordWifi123"
                  required={isWifiEnabled}
                  prefix={<KeyRound className="w-4 h-4" />}
                />
              </Field>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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

        {/* Info note */}
        <p className="text-[11px] text-center text-slate-400 leading-relaxed mb-6">
          Pengaturan di atas adalah pengaturan Default (Bawaan). Semua perangkat QR &amp; NFC akan menggunakan setelan ini KECUALI Anda mengaturnya secara khusus di bawah ini.
        </p>

        {/* Devices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Perangkat Anda ({qrList.length})</h2>
            <p className="text-xs text-slate-500 mt-1">Klik tombol <strong>Atur</strong> pada masing-masing perangkat untuk mengatur nama lokasi, link maps, dan Wi-Fi yang berbeda untuk tiap meja/ruangan.</p>
          </div>
          <CustomerQrTable
            qrList={qrList.filter(q => q.businessId === activeStore.id)}
            businessName={activeStore.businessName}
            wifiEnabled={activeStore.wifiEnabled}
          />
        </div>
      </div>
    </div>
  );
}
