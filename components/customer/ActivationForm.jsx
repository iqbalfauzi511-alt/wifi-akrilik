'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wifi,
  MapPin,
  Star,
  Building,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import { activateQrAction } from '@/lib/actions/qr-actions';

export default function ActivationForm({
  code,
  initialBusiness = null,
  userEmail = '',
  batchCode = '',
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedBusinessName, setSavedBusinessName] = useState('');

  // Pre-populate with existing business if user already registered one
  const [businessNameVal, setBusinessNameVal] = useState(initialBusiness?.businessName || '');
  const [mapsUrlVal, setMapsUrlVal] = useState(
    initialBusiness?.googleMapsReviewUrl || initialBusiness?.googleMapsUrl || ''
  );
  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(initialBusiness?.wifiEnabled));
  const [wifiNameVal, setWifiNameVal] = useState(initialBusiness?.wifiName || '');
  const [wifiPasswordVal, setWifiPasswordVal] = useState(initialBusiness?.wifiPassword || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('code', code);
    formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');
    const bName = formData.get('businessName') || '';

    const result = await activateQrAction(null, formData);

    if (result?.success) {
      setSavedBusinessName(bName);
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
    return (
      <Card className="text-center p-6 sm:p-8 border-emerald-200 bg-white shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Cobascan Anda Aktif!</h3>
        <p className="text-sm text-slate-600 mb-4">
          Produk Cobascan (QR + NFC) <span className="font-mono font-bold text-slate-900">{code}</span> kini telah aktif dan siap digunakan pelanggan untuk{' '}
          <strong className="text-slate-900">{savedBusinessName || 'Bisnis Anda'}</strong>.
        </p>

        {batchCode && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 max-w-sm mx-auto">
            ✨ Seluruh perangkat dalam <strong>Paket {batchCode}</strong> telah otomatis aktif dan terdaftar di dashboard akun Anda.
          </div>
        )}

        {/* Barcode Viewer with Download & Copy actions */}
        <div className="flex justify-center my-3">
          <QRCodeViewer
            code={code}
            subtitle={savedBusinessName}
            size={220}
            showActions={true}
          />
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
          <Link href="/dashboard" className="w-full sm:flex-1">
            <Button variant="outline" className="w-full text-xs">
              Ke Dashboard Cobascan
            </Button>
          </Link>
          <a
            href={`/q/${code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1"
          >
            <Button variant="primary" className="w-full text-xs">
              <span>Tes Scan / Tap NFC</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-slate-200/90">
      {/* Account linking header */}
      {userEmail && (
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Akun terhubung:</span>
            <strong className="font-mono text-slate-800">{userEmail}</strong>
          </div>
          {initialBusiness && (
            <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Profil Terdaftar
            </span>
          )}
        </div>
      )}

      {initialBusiness && (
        <div className="mb-5 p-3 rounded-xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 leading-relaxed">
          💡 Data bisnis Anda (<strong>{initialBusiness.businessName}</strong>) telah otomatis terisi di bawah. Anda bisa langsung klik <strong>Aktifkan Cobascan</strong> untuk menautkan perangkat baru ini, atau sesuaikan data jika diperlukan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Business Name */}
        <div>
          <Input
            label="Nama Bisnis"
            name="businessName"
            placeholder="Contoh: Kopi Senja / Toko Berkah"
            value={businessNameVal}
            onChange={(e) => setBusinessNameVal(e.target.value)}
            autoComplete="off"
            error={fieldErrors.businessName}
            required
            prefix={<Building className="w-4 h-4 text-slate-400" />}
            helperText="Nama ini akan tampil di bagian atas halaman saat customer scan QR atau tap NFC."
          />
        </div>

        {/* Google Review Link */}
        <div>
          <Input
            label="Google Review Link"
            name="googleMapsReviewUrl"
            type="url"
            placeholder="https://maps.app.goo.gl/... atau https://maps.google.com/..."
            value={mapsUrlVal}
            onChange={(e) => setMapsUrlVal(e.target.value)}
            autoComplete="off"
            error={fieldErrors.googleMapsReviewUrl || fieldErrors.googleMapsUrl}
            required
            prefix={<Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
            helperText="Arahkan pelanggan langsung ke halaman review bisnis Anda di Google."
          />
        </div>

        {/* Features Priority Section */}
        <div className="pt-3 pb-1 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Fitur Cobascan
          </label>

          {/* Feature 1: Google Review (Fungsi Utama) */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Google Review</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 text-[10px] font-bold">
                  Fungsi Utama
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Arahkan pelanggan langsung ke halaman review bisnis.
              </p>
            </div>
          </div>

          {/* Feature 2: Wi-Fi Access (Fitur Tambahan) */}
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
              id="wifiEnabledCheckbox"
              checked={isWifiEnabled}
              onChange={(e) => setIsWifiEnabled(e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <label htmlFor="wifiEnabledCheckbox" className="font-bold text-slate-900 cursor-pointer">
                  Wi-Fi Access
                </label>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isWifiEnabled ? 'bg-brand-200/80 text-brand-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isWifiEnabled ? 'Aktif' : 'Fitur Tambahan'}
                </span>
              </div>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Berikan akses Wi-Fi kepada pelanggan melalui Cobascan.
              </p>
            </div>
          </div>
        </div>

        {/* Conditional Wi-Fi Inputs */}
        {isWifiEnabled && (
          <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <Wifi className="w-4 h-4 text-brand-600" />
              <span>Detail Jaringan Wi-Fi</span>
            </div>

            <div>
              <Input
                label="Nama Wi-Fi"
                name="wifiName"
                placeholder="Contoh: KAFE-TAMU"
                value={wifiNameVal}
                onChange={(e) => setWifiNameVal(e.target.value)}
                autoComplete="off"
                error={fieldErrors.wifiName}
                required={isWifiEnabled}
                prefix={<Wifi className="w-4 h-4 text-slate-400" />}
                helperText="Nama SSID jaringan Wi-Fi bisnis Anda."
              />
            </div>

            <div>
              <Input
                label="Password Wi-Fi"
                name="wifiPassword"
                type="text"
                placeholder="Contoh: password123"
                value={wifiPasswordVal}
                onChange={(e) => setWifiPasswordVal(e.target.value)}
                autoComplete="off"
                error={fieldErrors.wifiPassword}
                required={isWifiEnabled}
                prefix={<KeyRound className="w-4 h-4 text-slate-400" />}
                helperText="Password ini disembunyikan sampai customer selesai membuka Google Review."
              />
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full shadow-md shadow-brand-600/20"
          >
            <span>Aktifkan Cobascan</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
