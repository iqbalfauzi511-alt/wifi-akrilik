'use client';

import React, { useState } from 'react';
import { Wifi, Instagram, Building, KeyRound, Check, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { updateBusinessWifiAction } from '@/lib/actions/business-actions';

export default function SettingsForm({ business }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await updateBusinessWifiAction(null, formData);

    setIsSubmitting(false);
    if (result?.success) {
      setStatusMessage({ type: 'success', text: result.message || 'Perubahan berhasil disimpan!' });
    } else {
      setStatusMessage({ type: 'error', text: result?.error || 'Gagal menyimpan perubahan' });
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
            label="Nama Bisnis / Kafe"
            name="businessName"
            defaultValue={business?.businessName || ''}
            error={fieldErrors.businessName}
            required
            prefix={<Building className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Link Instagram"
            name="instagramUrl"
            type="url"
            defaultValue={business?.instagramUrl || ''}
            error={fieldErrors.instagramUrl}
            required
            prefix={<Instagram className="w-4 h-4 text-slate-400" />}
            helperText="Masukkan link Instagram bisnis Anda, contoh: https://instagram.com/kopisenja"
          />

          <div className="pt-3 border-t border-slate-100">
            <Input
              label="Nama Wi-Fi (SSID)"
              name="wifiName"
              defaultValue={business?.wifiName || ''}
              error={fieldErrors.wifiName}
              required
              prefix={<Wifi className="w-4 h-4 text-slate-400" />}
              helperText="Nama jaringan Wi-Fi yang harus dipilih pengunjung."
            />
          </div>

          <div>
            <Input
              label="Password Wi-Fi Baru / Aktif"
              name="wifiPassword"
              type="text"
              defaultValue={business?.wifiPassword || ''}
              error={fieldErrors.wifiPassword}
              required
              prefix={<KeyRound className="w-4 h-4 text-slate-400" />}
              helperText="Setiap kali Anda mengganti password di sini, semua akrilik QR di meja otomatis menyajikan password baru."
            />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            💡 <strong>Rekomendasi untuk Pemilik (Owner):</strong> Ganti password Wi-Fi secara berkala (misal seminggu atau sebulan sekali). Anda <strong>tidak perlu mencetak ulang akrilik di meja</strong> karena seluruh akrilik QR akan langsung menyajikan password baru secara instan begitu disimpan di sini.
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Perubahan berlaku instan ke seluruh QR aktif.
          </p>
          <Button type="submit" isLoading={isSubmitting} size="md">
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Card>
  );
}
