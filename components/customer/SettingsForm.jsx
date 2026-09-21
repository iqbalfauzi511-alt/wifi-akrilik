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
            label="Nama Bisnis"
            name="businessName"
            defaultValue={business?.businessName || ''}
            error={fieldErrors.businessName}
            required
            prefix={<Building className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Google Review Link"
            name="googleMapsReviewUrl"
            type="url"
            defaultValue={business?.googleMapsReviewUrl || business?.googleMapsUrl || ''}
            error={fieldErrors.googleMapsReviewUrl || fieldErrors.googleMapsUrl}
            required
            prefix={<Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
            helperText="Masukkan link Google Maps review yang mengarahkan pelanggan langsung ke halaman ulasan bisnis Anda."
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
                    Wi-Fi Access
                  </label>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isWifiEnabled ? 'bg-brand-200/80 text-brand-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isWifiEnabled ? 'Aktif' : 'Fitur Tambahan (Nonaktif)'}
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Berikan akses Wi-Fi kepada pelanggan melalui Cobascan. Jika aktif, pengunjung dapat membuka password setelah melihat halaman ulasan. Jika dinonaktifkan, scan/tap langsung membuka Google Review.
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
                label="Nama Wi-Fi"
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
                helperText="Password ini disembunyikan sampai pelanggan selesai membuka Google Review."
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            💡 <strong>Satu Perangkat Cobascan (QR + NFC):</strong> Perangkat fisik QR dan chip NFC Anda selalu mengarahkan customer ke URL yang sama. Setiap perubahan Google Review Link atau password Wi-Fi di sini <strong>otomatis langsung aktif di seluruh meja tanpa perlu cetak ulang!</strong>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Perubahan berlaku instan ke seluruh perangkat Cobascan (QR &amp; NFC).
          </p>
          <Button type="submit" isLoading={isSubmitting} size="md">
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Card>
  );
}
