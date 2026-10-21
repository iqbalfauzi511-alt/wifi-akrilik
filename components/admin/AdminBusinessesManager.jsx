'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  AlertTriangle,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Store,
  QrCode,
  MapPin,
  Phone,
  Wifi,
  User,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
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
  const [copiedId, setCopiedId] = useState(null);

  // Filter businesses
  const filteredBusinesses = businesses.filter((b) => {
    const term = businessSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      b.businessName?.toLowerCase().includes(term) ||
      b.ownerEmail?.toLowerCase().includes(term) ||
      b.ownerName?.toLowerCase().includes(term) ||
      b.wifiName?.toLowerCase().includes(term) ||
      b.whatsappNumber?.toLowerCase().includes(term)
    );
  });

  // Handle Copy Link with touch feedback
  const handleCopyLink = async (id, url) => {
    if (!url) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch {
      // Fallback
    }
  };

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
          message: `Bisnis "${targetName}" berhasil dihapus. Seluruh perangkat QR terkait telah dikembalikan ke status BLANK (Stok Gudang).`,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="leading-snug">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Businesses Card */}
      <Card className="overflow-hidden !p-0">
        {/* Header & Search Bar - Optimized for Mobile First (44px tap target) & Desktop */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-600 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Mitra Bisnis ({businesses.length})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar outlet mitra, verifikasi sinkronisasi Google Review, dan perangkat aktif
              </p>
            </div>

            {/* Search Input - Full width mobile, 44px min touch height */}
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                placeholder="Cari bisnis, pemilik, atau WhatsApp..."
                className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 min-h-[44px] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {businessSearch && (
                <button
                  type="button"
                  onClick={() => setBusinessSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 min-w-[28px] min-h-[28px] flex items-center justify-center transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Bisnis</th>
                <th className="py-3 px-4 font-semibold">Pemilik</th>
                <th className="py-3 px-4 font-semibold text-center">Perangkat</th>
                <th className="py-3 px-4 font-semibold">WhatsApp</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Wi-Fi Default</th>
                <th className="py-3 px-4 font-semibold">Review Google</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada bisnis yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b) => {
                  const reviewLink = b.effectiveReviewUrl || b.googleMapsReviewUrl || b.googleMapsUrl || b.rawReviewUrl;
                  const hasMaps = Boolean(reviewLink);
                  const isDeviceSource = b.mapsSource === 'device';
                  const isCopied = copiedId === b.id;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-50 to-blue-100 border border-brand-200/50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {b.businessName?.substring(0, 2).toUpperCase() || 'CS'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{b.businessName}</div>
                            <div className="text-[11px] text-slate-400">
                              Terdaftar: {new Date(b.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.ownerName || '-'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.ownerEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                          <QrCode className="w-3 h-3 text-slate-500" />
                          <span>{b.qrCount || 0} unit</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {b.whatsappNumber ? (
                          <a
                            href={`https://wa.me/${b.whatsappNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 font-medium hover:underline"
                          >
                            <span>+{b.whatsappNumber}</span>
                            <ExternalLink className="w-3 h-3 text-emerald-500" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {b.wifiEnabled ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900">{b.wifiName || '-'}</div>
                            {b.wifiUsername && (
                              <div className="text-[10px] text-slate-500 font-mono italic">User: {b.wifiUsername}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>


                      <td className="py-3.5 px-4">
                        {hasMaps ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={reviewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-semibold border border-brand-200 transition-colors"
                              title="Buka link ulasan Google"
                            >
                              <span>Buka Link Review</span>
                              <ExternalLink className="w-3 h-3 text-brand-500" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(b.id, reviewLink)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Salin link Google Maps"
                              aria-label="Salin link Google Maps"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {isDeviceSource && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold" title="Link disinkronkan dari QR perangkat">
                                Sync QR
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum disetel</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBusinessToDelete(b)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus bisnis ini"
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

        {/* Mobile Card View */}
        <div className="lg:hidden flex flex-col divide-y divide-slate-100 bg-white">
          {filteredBusinesses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada bisnis yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            filteredBusinesses.map((b) => {
              const reviewLink = b.effectiveReviewUrl || b.googleMapsReviewUrl || b.googleMapsUrl || b.rawReviewUrl;
              const hasMaps = Boolean(reviewLink);
              const isDeviceSource = b.mapsSource === 'device';
              const isCopied = copiedId === b.id;

              return (
                <div key={b.id} className="p-4 sm:p-5 bg-white transition-colors space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-100 border border-brand-200/50 text-brand-700 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {b.businessName?.substring(0, 2).toUpperCase() || 'CS'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                          {b.businessName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Terdaftar: {new Date(b.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.qrCount || 0} unit</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-3 sm:p-3.5 border border-slate-200/70 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Pemilik</div>
                        <div className="font-semibold text-slate-800 text-xs truncate">{b.ownerName || '-'}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{b.ownerEmail}</div>
                      </div>
                    </div>
                    {/* WhatsApp Block */}
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">WhatsApp</div>
                        {b.whatsappNumber ? (
                          <a
                            href={`https://wa.me/${b.whatsappNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-medium text-emerald-700 hover:text-emerald-800 text-xs inline-flex items-center gap-1"
                          >
                            <span>+{b.whatsappNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic font-normal text-xs">Tidak ada nomor</span>
                        )}
                      </div>
                    </div>

                    {/* Wi-Fi Default Block */}
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                      <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Wi-Fi Default</div>
                        {b.wifiEnabled ? (
                          <>
                            <div className="font-semibold text-slate-800 text-xs truncate">{b.wifiName || '-'}</div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">
                              {b.wifiUsername ? `User: ${b.wifiUsername}` : 'Tanpa username'}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic font-normal text-xs">Wi-Fi tidak diaktifkan</span>
                        )}
                      </div>
                    </div>

                    {/* Google Maps Review Block */}
                    <div className="pt-2 border-t border-slate-200/50 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Google Review</span>
                        </div>
                        {hasMaps && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDeviceSource
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {isDeviceSource ? 'Sync QR Stand' : 'Tersambung'}
                          </span>
                        )}
                      </div>

                      {hasMaps ? (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={reviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200/80 inline-flex items-center justify-center gap-1.5 active:bg-brand-200 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span>Buka Link Review</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(b.id, reviewLink)}
                            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center justify-center gap-1.5 active:bg-slate-200 transition-colors"
                            title="Salin link Google Maps"
                            aria-label="Salin link Google Maps"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-emerald-700 font-bold">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-xs py-1">
                          Belum disetel oleh pemilik bisnis
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400">
                      ID: <span className="font-mono">{b.id?.substring(0, 8)}...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBusinessToDelete(b)}
                      className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:bg-rose-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Bisnis</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
                <p className="font-bold text-sm sm:text-base text-rose-900">
                  Hapus Bisnis &ldquo;{businessToDelete.businessName}&rdquo;?
                </p>
                <p className="mt-1 leading-relaxed text-rose-700 text-xs sm:text-sm">
                  Profil bisnis ini akan dihapus dari sistem. Seluruh perangkat ({businessToDelete.qrCount || 0} unit) yang sebelumnya terhubung dengan bisnis ini akan otomatis dilepas dan dikembalikan ke <strong>Stok Gudang (BLANK)</strong> tanpa merusak atau menghapus nomor seri QR code, sehingga hardware dapat diaktivasi kembali oleh mitra baru.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBusinessToDelete(null)}
                disabled={isDeleting}
                className="min-h-[44px] px-4"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteBusiness}
                className="min-h-[44px] px-4"
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
