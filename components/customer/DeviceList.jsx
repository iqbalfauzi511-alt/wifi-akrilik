'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings2,
  Wifi,
  WifiOff,
  ExternalLink,
  MapPin,
  Check,
  AlertCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { updateDeviceSettingsAction } from '@/lib/actions/qr-actions';

export default function DeviceList({ qrList = [], businessName, defaultWifiEnabled }) {
  const router = useRouter();
  const [editQr, setEditQr] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async (formData) => {
    formData.append('qrId', editQr.id);
    setIsSaving(true);
    const result = await updateDeviceSettingsAction(null, formData);
    setIsSaving(false);
    if (result?.success) {
      showNotif('success', 'Pengaturan perangkat disimpan.');
      setEditQr(null);
      router.refresh();
    } else {
      showNotif('error', result?.error || 'Gagal menyimpan.');
    }
  };

  if (qrList.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <Settings2 className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">Belum ada perangkat aktif</p>
        <p className="text-[11px] text-slate-400 mt-1">Aktivasi perangkat Cobascan untuk mulai menerima ulasan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`mx-5 my-3 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success'
              ? <Check className="w-3.5 h-3.5 shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {notification.message}
          </div>
          <button onClick={() => setNotification(null)} className="p-0.5 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Device Rows */}
      <ul className="divide-y divide-slate-100">
        {qrList.map((qr) => {
          const hasCustomConfig = !!(qr.deviceName || qr.qrGoogleMapsReviewUrl || qr.qrWifiEnabled !== null);
          const wifiOn = qr.wifiEnabled;
          const locationName = qr.deviceName || businessName || '—';

          return (
            <li key={qr.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors group">
              {/* Left: Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">{qr.code}</span>
                  <Badge status={qr.status} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {locationName}
                  </span>
                  {wifiOn
                    ? <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md"><Wifi className="w-2.5 h-2.5" /> Wi-Fi</span>
                    : <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md"><WifiOff className="w-2.5 h-2.5" /> Tanpa Wi-Fi</span>
                  }
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <a
                  href={`/q/${qr.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Buka halaman pengunjung"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setEditQr(qr)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  Atur
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editQr}
        onClose={() => setEditQr(null)}
        title={editQr?.code || ''}
        description="Konfigurasi khusus untuk perangkat ini"
      >
        {editQr && (
          <form
            action={handleSave}
            className="space-y-4 pt-1"
          >
            {/* Nama Lokasi */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nama Lokasi / Ruangan
              </label>
              <input
                type="text"
                name="deviceName"
                defaultValue={editQr.deviceName || ''}
                placeholder={businessName || 'Contoh: Meja 1, Lantai 2...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
              <p className="mt-1 text-[11px] text-slate-400">Kosongkan untuk pakai nama bisnis utama.</p>
            </div>

            {/* Link Google Review */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Link Google Review
              </label>
              <input
                type="url"
                name="googleMapsReviewUrl"
                defaultValue={editQr.googleMapsReviewUrl || ''}
                placeholder="https://g.page/r/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>

            {/* Wi-Fi Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="wifiEnabled"
                    value="true"
                    defaultChecked={editQr.wifiEnabled}
                    className="sr-only peer"
                    id="wifi-toggle"
                  />
                  <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-slate-900 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Wi-Fi Aktif</p>
                  <p className="text-[11px] text-slate-400">Tamu dapat akses Wi-Fi setelah memberi rating 3–5 bintang.</p>
                </div>
              </label>

              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nama Wi-Fi (SSID)</label>
                  <input
                    type="text"
                    name="wifiName"
                    defaultValue={editQr.wifiName || ''}
                    placeholder="Nama jaringan Wi-Fi..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password Wi-Fi</label>
                  <input
                    type="text"
                    name="wifiPassword"
                    defaultValue={editQr.wifiPassword || ''}
                    placeholder="Password Wi-Fi..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditQr(null)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
