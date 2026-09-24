'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  AlertTriangle,
  Building,
  ExternalLink,
  Search,
  CheckCircle2,
  Store,
  Wifi,
  Phone,
} from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { deleteBusinessAction } from '@/lib/actions/admin-actions';

export default function AdminBusinessesManager({ initialBusinesses = [] }) {
  const router = useRouter();

  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [businessSearch, setBusinessSearch] = useState('');
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter businesses
  const filteredBusinesses = businesses.filter((b) => {
    const term = businessSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      b.businessName?.toLowerCase().includes(term) ||
      b.ownerEmail?.toLowerCase().includes(term) ||
      b.ownerName?.toLowerCase().includes(term) ||
      b.wifiName?.toLowerCase().includes(term)
    );
  });

  // Handle Delete Business
  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;

    try {
      setIsDeleting(true);
      const targetId = businessToDelete.id;
      const targetName = businessToDelete.businessName;

      const res = await deleteBusinessAction(targetId);
      setIsDeleting(false);
      setBusinessToDelete(null);

      if (res?.success) {
        setBusinesses((prev) => prev.filter((b) => b.id !== targetId));
        setNotification({
          type: 'success',
          message: `Bisnis "${targetName}" berhasil dihapus. Seluruh perangkat QR terkait telah dikembalikan ke status BLANK.`,
        });
        router.refresh();
      } else {
        alert(res?.error || 'Gagal menghapus bisnis');
      }
    } catch {
      setIsDeleting(false);
      alert('Terjadi kendala saat menghapus bisnis');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-4 p-1 rounded-lg hover:bg-black/5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Businesses Table */}
      <Card>
        <CardHeader
          title={`Mitra Bisnis (${businesses.length})`}
          subtitle="Daftar kafe, restoran, dan outlet mitra yang terdaftar di platform"
          action={
            <div className="w-full sm:w-72 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                placeholder="Cari bisnis, pemilik, atau SSID..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Bisnis</th>
                <th className="py-3 px-4 font-semibold">Pemilik</th>
                <th className="py-3 px-4 font-semibold text-center">Perangkat</th>
                <th className="py-3 px-4 font-semibold">Status Wi-Fi</th>
                <th className="py-3 px-4 font-semibold">WhatsApp</th>
                <th className="py-3 px-4 font-semibold">Review Google</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada bisnis yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b) => {
                  const mapsUrl = b.googleMapsReviewUrl || b.googleMapsUrl;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1A73E8] font-bold text-xs flex items-center justify-center shrink-0">
                            {b.businessName?.substring(0, 2).toUpperCase() || 'CS'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{b.businessName}</div>
                            <div className="text-[11px] text-slate-400">
                              Terdaftar: {new Date(b.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{b.ownerName || '-'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.ownerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900">{b.qrCount || 0} unit</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            b.wifiEnabled ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.wifiEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          {b.wifiEnabled ? `Aktif (${b.wifiName || 'SSID'})` : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {b.whatsappNumber ? `+${b.whatsappNumber}` : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                          >
                            <span>Lihat Link</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum diatur</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBusinessToDelete(b)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Bisnis ini"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Business Confirmation Modal */}
      <Modal
        isOpen={!!businessToDelete}
        onClose={() => setBusinessToDelete(null)}
        title="Hapus Bisnis"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        {businessToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">
                  Hapus Bisnis &ldquo;{businessToDelete.businessName}&rdquo;?
                </p>
                <p className="mt-1 leading-relaxed text-rose-700">
                  Profil bisnis ini akan dihapus dari sistem. Seluruh perangkat ({businessToDelete.qrCount || 0} unit) yang sebelumnya terhubung dengan bisnis ini akan otomatis dilepas dan kembali ke status BLANK agar dapat diaktivasi kembali.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBusinessToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteBusiness}
              >
                Hapus Bisnis
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
