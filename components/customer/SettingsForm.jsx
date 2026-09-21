'use client';

import React, { useState } from 'react';
import {
  Wifi,
  MapPin,
  Star,
  Building,
  KeyRound,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { updateBusinessWifiAction } from '@/lib/actions/business-actions';

export default function SettingsForm({ business }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(business?.wifiEnabled));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');

    const result = await updateBusinessWifiAction(null, formData);

    setIsSubmitting(false);
    if (result?.success) {
      setStatusMessage({ type: 'success', text: result.message || '✓ Perubahan berhasil disimpan.' });
    } else {
      setStatusMessage({ type: 'error', text: result?.error || 'Perubahan gagal disimpan. Silakan coba lagi.' });
      if (result?.errors) {
        setFieldErrors(result.errors);
      }
    }
  };

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Nama Bisnis / Toko / Kafe"
            name="businessName"
            defaultValue={business?.businessName || ''}
            error={fieldErrors.businessName}
            required
            prefix={<Building className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Link Google Maps (Review & Rating)"
            name="googleMapsUrl"
            type="url"
            defaultValue={business?.googleMapsUrl || ''}
            error={fieldErrors.googleMapsUrl}
            required
            prefix={<MapPin className="w-4 h-4 text-emerald-600" />}
            helperText="Masukkan link profil Google Maps bisnis Anda, contoh: https://maps.app.goo.gl/... atau https://maps.google.com/..."
          />

          {/* Wi-Fi Access Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <div
              onClick={() => setIsWifiEnabled((prev) => !prev)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isWifiEnabled
                  ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="checkbox"
                id="settingsWifiToggle"
                checked={isWifiEnabled}
                onChange={(e) => setIsWifiEnabled(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <label htmlFor="settingsWifiToggle" className="font-bold text-slate-900 cursor-pointer">
                    Sediakan Akses Wi-Fi Pelanggan
                  </label>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isWifiEnabled ? 'bg-brand-200/80 text-brand-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isWifiEnabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Jika diaktifkan, halaman publik akan menampilkan opsi Wi-Fi setelah pengunjung menekan tombol konfirmasi rating Google Maps. Jika dinonaktifkan, halaman hanya akan menampilkan tombol rating Google Maps.
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Wi-Fi Fields */}
          {isWifiEnabled && (
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <Wifi className="w-4 h-4 text-brand-600" />
                <span>Kredensial Jaringan Wi-Fi</span>
              </div>

              <Input
                label="Nama Wi-Fi (SSID)"
                name="wifiName"
                defaultValue={business?.wifiName || ''}
                error={fieldErrors.wifiName}
                required={isWifiEnabled}
                prefix={<Wifi className="w-4 h-4 text-slate-400" />}
                helperText="Nama jaringan Wi-Fi yang harus dipilih pelanggan di HP mereka."
              />

              <Input
                label="Password Wi-Fi"
                name="wifiPassword"
                type="text"
                defaultValue={business?.wifiPassword || ''}
                error={fieldErrors.wifiPassword}
                required={isWifiEnabled}
                prefix={<KeyRound className="w-4 h-4 text-slate-400" />}
                helperText="Password ini disembunyikan sampai pelanggan menekan tombol Saya Sudah Memberikan Rating."
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            💡 <strong>Rekomendasi untuk Pemilik (Owner):</strong> Produk fisik QR dan chip NFC Anda selalu mengarahkan customer ke URL yang sama. Jika Anda mengganti password Wi-Fi atau mengubah link Google Maps di sini, seluruh QR akrilik dan tag NFC di meja <strong>otomatis langsung ter-update seketika tanpa perlu dicetak ulang!</strong>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Perubahan berlaku instan ke seluruh QR dan NFC aktif.
          </p>
          <Button type="submit" isLoading={isSubmitting} size="md">
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Card>
  );
}
