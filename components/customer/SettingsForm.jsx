'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wifi,
  MapPin,
  Star,
  Building,
  KeyRound,
  Check,
  Sparkles,
  PlusCircle,
  Store,
  ChevronRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LogoUploader from '@/components/ui/LogoUploader';
import {
  updateBusinessWifiAction,
} from '@/lib/actions/business-actions';

export default function SettingsForm({ business, businesses = [] }) {
  const router = useRouter();

  // Combine initial list of businesses
  const initialStores = businesses.length > 0
    ? businesses
    : (business ? [business] : []);

  const [stores, setStores] = useState(initialStores);
  const [selectedStoreId, setSelectedStoreId] = useState(
    business?.id || initialStores[0]?.id || ''
  );

  // Active store being viewed/edited
  const activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0] || null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top Outlet Switcher Tabs (Only shown if customer owns multiple registered stores) */}
      {stores.length > 1 && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Outlet / Cabang Bisnis
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {stores.length} Cabang Terdaftar
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stores.map((store) => {
              const isSelected = store.id === activeStore?.id;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    setSelectedStoreId(store.id);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/80 text-brand-900 border-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {store.businessName?.charAt(0)?.toUpperCase() || 'T'}
                  </div>

                  <div className="text-left">
                    <div className="leading-tight">{store.businessName}</div>
                    <div className="text-[10px] font-normal text-slate-500">
                      {store.wifiEnabled ? 'Wi-Fi Aktif' : 'Review Direct'}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-brand-600 ml-1 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Content: Edit Selected Store */}
      {activeStore ? (
        <EditBranchForm
          key={activeStore.id}
          store={activeStore}
          onSuccess={(updatedFields) => {
            setStores((prev) =>
              prev.map((s) => (s.id === activeStore.id ? { ...s, ...updatedFields } : s))
            );
            router.refresh();
          }}
        />
      ) : null}

      {/* Info Callout explaining that new branches are registered during device activation */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-800">
            Pendaftaran Cabang Baru:
          </div>
          <p className="leading-relaxed">
            Untuk mendaftarkan cabang/outlet baru, cukup lakukan scan atau tap NFC pada stand fisik Cobascan baru Anda di halaman aktivasi (<span className="font-mono text-[11px] font-semibold text-slate-800">/activate/[kode]</span>). Di sana Anda dapat memilih cabang yang sudah ada atau mendaftarkannya sebagai cabang baru.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component for editing an existing branch/store
 */
function EditBranchForm({ store, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isWifiEnabled, setIsWifiEnabled] = useState(Boolean(store?.wifiEnabled));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('wifiEnabled', isWifiEnabled ? 'true' : 'false');
    formData.set('businessId', store.id);

    const result = await updateBusinessWifiAction(null, formData);

    setIsSubmitting(false);
    if (result?.success) {
      setStatusMessage({
        type: 'success',
        text: `✓ Pengaturan untuk "${formData.get('businessName') || store.businessName}" berhasil disimpan!`,
      });
      if (onSuccess) {
        onSuccess({
          businessName: formData.get('businessName'),
          logoUrl: formData.get('logoUrl'),
          googleMapsReviewUrl: formData.get('googleMapsReviewUrl'),
          wifiEnabled: isWifiEnabled,
          wifiName: formData.get('wifiName'),
          wifiPassword: formData.get('wifiPassword'),
        });
      }
    } else {
      setStatusMessage({
        type: 'error',
        text: result?.error || 'Perubahan gagal disimpan. Silakan coba lagi.',
      });
      if (result?.errors) {
        setFieldErrors(result.errors);
      }
    }
  };

  return (
    <Card className="max-w-2xl">
      <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
            Outlet / Cabang Aktif
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {store.businessName}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-500 font-mono">
            ID: {store.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="businessId" value={store.id} />

        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Nama Cabang / Toko"
            name="businessName"
            defaultValue={store?.businessName || ''}
            error={fieldErrors.businessName}
            required
            prefix={<Building className="w-4 h-4 text-slate-500" />}
            helperText="Contoh: Kopi Kenangan - Senopati atau Kopi Kenangan - Kemang"
          />

          <LogoUploader
            initialLogo={store?.logoUrl || ''}
            name="logoUrl"
            label="Logo Bisnis Cabang"
            helperText="Perubahan logo langsung tampil di seluruh scan QR dan tap NFC meja cabang ini tanpa perlu cetak ulang."
          />

          <Input
            label="Google Review Link Cabang"
            name="googleMapsReviewUrl"
            type="url"
            defaultValue={store?.googleMapsReviewUrl || store?.googleMapsUrl || ''}
            error={fieldErrors.googleMapsReviewUrl || fieldErrors.googleMapsUrl}
            required
            prefix={<Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
            helperText="Link review spesifik untuk outlet ini agar ulasan masuk ke lokasi cabang yang tepat di Google Maps."
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
                id={`wifiToggle_${store.id}`}
                checked={isWifiEnabled}
                onChange={(e) => setIsWifiEnabled(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <label htmlFor={`wifiToggle_${store.id}`} className="font-bold text-slate-900 cursor-pointer">
                    Akses Wi-Fi Khusus Cabang Ini
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isWifiEnabled ? 'bg-brand-200/80 text-brand-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isWifiEnabled ? 'Wi-Fi Aktif' : 'Fitur Tambahan (Nonaktif)'}
                  </span>
                </div>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Jika aktif, pengunjung cabang ini dapat membuka password Wi-Fi setelah melihat halaman review. Jika nonaktif, scan langsung mengarahkan pengunjung ke Google Review.
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Wi-Fi Fields */}
          {isWifiEnabled && (
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <Wifi className="w-4 h-4 text-brand-600" />
                <span>Kredensial Wi-Fi untuk {store.businessName}</span>
              </div>

              <Input
                label="Nama Wi-Fi (SSID)"
                name="wifiName"
                defaultValue={store?.wifiName || ''}
                error={fieldErrors.wifiName}
                required={isWifiEnabled}
                prefix={<Wifi className="w-4 h-4 text-slate-500" />}
                helperText="Nama jaringan Wi-Fi lokal di lokasi cabang ini."
              />

              <Input
                label="Password Wi-Fi"
                name="wifiPassword"
                type="text"
                defaultValue={store?.wifiPassword || ''}
                error={fieldErrors.wifiPassword}
                required={isWifiEnabled}
                prefix={<KeyRound className="w-4 h-4 text-slate-500" />}
                helperText="Password Wi-Fi cabang ini. Aman dan hanya dibuka setelah pelanggan menyelesaikan ulasan."
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            💡 <strong>Dinamis &amp; Terpusat:</strong> Seluruh stand akrilik Cobascan yang terhubung ke <strong>{store.businessName}</strong> akan langsung sinkron dengan link Google Review dan password Wi-Fi cabang ini secara real-time.
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Perubahan hanya berlaku untuk perangkat di cabang <strong>{store.businessName}</strong>.
          </p>
          <Button type="submit" isLoading={isSubmitting} size="md">
            Simpan Perubahan Cabang
          </Button>
        </div>
      </form>
    </Card>
  );
}
