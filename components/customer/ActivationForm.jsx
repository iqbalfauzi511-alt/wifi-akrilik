'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, Instagram, Building, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { activateQrAction } from '@/lib/actions/qr-actions';

export default function ActivationForm({ code, existingBusiness }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('code', code);

    const result = await activateQrAction(null, formData);

    if (result?.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result?.error || 'Gagal mengaktifkan QR Code');
      if (result?.errors) {
        setFieldErrors(result.errors);
      }
    }
  };

  if (isSuccess) {
    return (
      <Card className="text-center p-8 border-emerald-200 bg-emerald-50/50">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Aktivasi Berhasil!</h3>
        <p className="text-sm text-slate-600 mb-5">
          QR Code <span className="font-mono font-bold">{code}</span> kini telah aktif dan terhubung ke bisnis Anda.
        </p>
        <p className="text-xs text-slate-500">Mengarahkan Anda ke Dashboard...</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-slate-200/90">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        <div>
          <Input
            label="Nama Bisnis / Kafe"
            name="businessName"
            placeholder="Contoh: Kopi Senja"
            defaultValue={existingBusiness?.businessName || ''}
            error={fieldErrors.businessName}
            required
            prefix={<Building className="w-4 h-4 text-slate-400" />}
            helperText="Nama ini akan tampil di bagian atas halaman saat pengunjung scan QR."
          />
        </div>

        <div>
          <Input
            label="Link Instagram"
            name="instagramUrl"
            type="url"
            placeholder="https://www.instagram.com/kopisenja/"
            defaultValue={existingBusiness?.instagramUrl || ''}
            error={fieldErrors.instagramUrl}
            required
            prefix={<Instagram className="w-4 h-4 text-slate-400" />}
            helperText="Masukkan link Instagram bisnis Anda, contoh: https://instagram.com/kopisenja"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Input
            label="Nama Wi-Fi (SSID)"
            name="wifiName"
            placeholder="Contoh: KOPI SENJA"
            defaultValue={existingBusiness?.wifiName || ''}
            error={fieldErrors.wifiName}
            required
            prefix={<Wifi className="w-4 h-4 text-slate-400" />}
            helperText="Nama jaringan Wi-Fi yang akan dicari pelanggan di ponsel mereka."
          />
        </div>

        <div>
          <Input
            label="Password Wi-Fi"
            name="wifiPassword"
            type="text"
            placeholder="Contoh: kopisenja123"
            defaultValue={existingBusiness?.wifiPassword || ''}
            error={fieldErrors.wifiPassword}
            required
            prefix={<KeyRound className="w-4 h-4 text-slate-400" />}
            helperText="Password ini akan diberikan setelah pengunjung menekan tombol Follow."
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full shadow-md shadow-brand-600/20"
          >
            <span>Aktifkan Smart Wi-Fi QR</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
