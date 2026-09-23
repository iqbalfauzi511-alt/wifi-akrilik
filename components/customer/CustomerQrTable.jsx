'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import {
  ExternalLink,
  Eye,
  QrCode,
  Download,
  Star,
  Wifi,
  CheckSquare,
  Square,
  MinusSquare,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  Building,
  Store,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import EmptyState from '@/components/ui/EmptyState';
import {
  customerBulkUpdateStatusAction,
  customerBulkUnlinkAction,
} from '@/lib/actions/qr-actions';

export default function CustomerQrTable({
  qrList = [],
  businessName,
  wifiEnabled = true,
}) {
  const router = useRouter();

  const [selectedQr, setSelectedQr] = useState(null);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'wifi'
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract store options for filtering
  const storeOptions = React.useMemo(() => {
    const map = new Map();
    qrList.forEach((q) => {
      const name = q.businessName || businessName || 'Outlet Utama';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [qrList, businessName]);

  const filteredQrList = React.useMemo(() => {
    if (selectedStoreFilter === 'all') return qrList;
    return qrList.filter(
      (q) => (q.businessName || businessName || 'Outlet Utama') === selectedStoreFilter
    );
  }, [qrList, businessName, selectedStoreFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStoreFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQrList.length / itemsPerPage));
  const paginatedQrList = filteredQrList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [notification, setNotification] = useState(null);

  if (qrList.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Perangkat Cobascan"
        description="Scan QR Code atau tap chip NFC pada produk fisik Cobascan untuk mengaktifkan dan menghubungkannya dengan bisnis ini."
      />
    );
  }

  const allSelected = filteredQrList.length > 0 && filteredQrList.every((q) => selectedIds.has(q.id));
  const isIndeterminate = filteredQrList.some((q) => selectedIds.has(q.id)) && !allSelected;

  // Toggle selection for all: If any items are selected, unselect all. If none, select all filtered.
  const handleToggleSelectAll = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQrList.map((q) => q.id)));
    }
  };

  // Toggle selection for single item
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bulk Status Update (Active / Disabled)
  const handleBulkStatus = async (newStatus) => {
    if (selectedIds.size === 0) return;
    try {
      setIsProcessingBulk(true);
      const result = await customerBulkUpdateStatusAction(
        Array.from(selectedIds),
        newStatus
      );
      setIsProcessingBulk(false);

      if (result?.success) {
        setNotification({
          type: 'success',
          message: `Berhasil mengubah status ${result.count || selectedIds.size} perangkat menjadi ${
            newStatus === 'active' ? 'Aktif' : 'Nonaktif'
          }.`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        setNotification({
          type: 'error',
          message: result?.error || 'Gagal mengubah status massal.',
        });
      }
    } catch (e) {
      setIsProcessingBulk(false);
      setNotification({
        type: 'error',
        message: 'Terjadi kendala saat mengubah status perangkat.',
      });
    }
  };

  // Bulk Unlink Devices
  const handleBulkUnlink = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsProcessingBulk(true);
      const result = await customerBulkUnlinkAction(Array.from(selectedIds));
      setIsProcessingBulk(false);
      setShowUnlinkModal(false);

      if (result?.success) {
        setNotification({
          type: 'success',
          message: `Berhasil melepaskan ${result.count || selectedIds.size} perangkat dari akun Anda.`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        setNotification({
          type: 'error',
          message: result?.error || 'Gagal melepaskan perangkat.',
        });
      }
    } catch (e) {
      setIsProcessingBulk(false);
      setShowUnlinkModal(false);
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan saat melepaskan perangkat.',
      });
    }
  };

  // Bulk ZIP Download
  const handleBulkDownloadZip = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsProcessingBulk(true);
      const zip = new JSZip();
      const folder = zip.folder('cobascan-qr');

      const appUrl =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://wifi-akrilik.vercel.app';
      const cleanOrigin = appUrl.replace(/\/$/, '');

      const itemsToDownload = qrList.filter((q) => selectedIds.has(q.id));

      for (const item of itemsToDownload) {
        const targetUrl = `${cleanOrigin}/q/${item.code}`;
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        folder.file(`cobascan_${item.code}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Cobascan_${itemsToDownload.length}_Perangkat.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setIsProcessingBulk(false);
      setNotification({
        type: 'success',
        message: `Berhasil mengunduh ZIP untuk ${itemsToDownload.length} perangkat Cobascan.`,
      });
    } catch (e) {
      setIsProcessingBulk(false);
      setNotification({
        type: 'error',
        message: 'Gagal membuat file ZIP perangkat.',
      });
    }
  };

  return (
    <>
      {/* Toast / Notification Banner */}
      {notification && (
        <div
          className={`mb-4 p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Batch Action Bar when items selected */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-black shadow-sm">
              {selectedIds.size}
            </span>
            <div>
              <div className="text-xs font-bold text-white">
                {selectedIds.size} Perangkat Dipilih
              </div>
              <div className="text-[11px] text-slate-300">
                Pilih aksi massal untuk perangkat yang ditandai:
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isProcessingBulk}
              onClick={() => handleBulkStatus('active')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ToggleRight className="w-4 h-4" />
              <span>Aktifkan</span>
            </button>

            <button
              type="button"
              disabled={isProcessingBulk}
              onClick={() => handleBulkStatus('disabled')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ToggleLeft className="w-4 h-4" />
              <span>Nonaktifkan</span>
            </button>

            <button
              type="button"
              disabled={isProcessingBulk}
              onClick={handleBulkDownloadZip}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>

            <button
              type="button"
              disabled={isProcessingBulk}
              onClick={() => setShowUnlinkModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Lepas dari Akun</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
              title="Batalkan semua pilihan"
            >
              <X className="w-3.5 h-3.5 text-slate-300" />
              <span>Batal Pilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Store / Branch Filter Pills (if user has devices across multiple branches) */}
      {storeOptions.length > 1 && (
        <div className="mb-4 p-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
            Filter Cabang:
          </span>
          <button
            type="button"
            onClick={() => setSelectedStoreFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStoreFilter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Semua Cabang ({qrList.length})
          </button>
          {storeOptions.map(({ name, count }) => {
            const isSelected = selectedStoreFilter === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedStoreFilter(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700 font-bold border-y border-slate-200">
            <tr>
              {/* Checkbox Column */}
              <th className="py-3.5 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center justify-center p-1 rounded hover:bg-slate-200 transition-colors text-slate-600"
                  title={allSelected ? 'Batal pilih semua' : 'Pilih semua'}
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-brand-600" />
                  ) : isIndeterminate ? (
                    <MinusSquare className="w-4 h-4 text-brand-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4 font-semibold">Perangkat Cobascan</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-center">Total Scan &amp; Tap</th>
              <th className="py-3.5 px-4 font-semibold">Tanggal Aktivasi</th>
              <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedQrList.map((qr) => {
              const isSelected = selectedIds.has(qr.id);
              return (
                <tr
                  key={qr.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-brand-50/50 hover:bg-brand-50/70' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(qr.id)}
                      className="flex items-center justify-center p-1 rounded hover:bg-slate-200 transition-colors text-slate-600"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{qr.code}</span>
                      {qr.batchCode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {qr.batchCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Store className="w-3 h-3 text-brand-600 shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[220px]">
                          {qr.businessName || businessName || 'Outlet Utama'}
                        </span>
                      </span>
                      {qr.wifiEnabled ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                          <Wifi className="w-2.5 h-2.5" /> Wi-Fi
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Review Direct
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge status={qr.status} />
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                      {qr.scanCount || 0} scan
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {qr.activatedAt
                      ? new Date(qr.activatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQr(qr)}
                        className="text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat / Download
                      </Button>
                      <a
                        href={`/q/${qr.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Buka Scan Landing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="text-xs text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredQrList.length)}</span> dari <span className="font-semibold text-slate-700">{filteredQrList.length}</span> perangkat
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="text-xs py-1 px-2.5 h-auto shadow-none"
            >
              Sebelumnya
            </Button>
            <div className="px-3 text-xs font-medium text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="text-xs py-1 px-2.5 h-auto shadow-none"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Unlink */}
      <Modal
        isOpen={showUnlinkModal}
        onClose={() => setShowUnlinkModal(false)}
        title="Lepaskan Perangkat Terpilih?"
        description="Konfirmasi pelepasan perangkat Cobascan dari dashboard Anda."
      >
        <div className="pt-2 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            ⚠️ Anda memilih untuk melepaskan <strong>{selectedIds.size} perangkat</strong> dari akun bisnis Anda. Perangkat ini akan di-reset menjadi status kosong (unlinked) sehingga dapat disimpan atau didaftarkan kembali nanti.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessingBulk}
              onClick={() => setShowUnlinkModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isProcessingBulk}
              onClick={handleBulkUnlink}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Ya, Lepaskan {selectedIds.size} Perangkat
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Preview & Download Modal */}
      <Modal
        isOpen={!!selectedQr}
        onClose={() => {
          setSelectedQr(null);
          setActiveTab('review');
        }}
        title={`Perangkat Cobascan ${selectedQr?.code || ''}`}
        description={`Terhubung ke ${selectedQr?.businessName || businessName || 'Bisnis Anda'}`}
      >
        {selectedQr && (
          <div className="pt-2 space-y-4">
            {/* Tab Selection if Wi-Fi Enabled for this specific QR */}
            {Boolean(selectedQr.wifiEnabled ?? wifiEnabled) && (
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('review')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'review'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Google Review (Direct)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('wifi')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'wifi'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5 text-brand-600" />
                  <span>Google Review &amp; Wi-Fi</span>
                </button>
              </div>
            )}

            {activeTab === 'review' ? (
              <div>
                <p className="text-xs text-center text-slate-500 mb-3">
                  📍 <strong>Tujuan:</strong> Mengarahkan langsung ke ulasan Google Review saat pelanggan scan QR atau tap NFC.
                </p>
                <QRCodeViewer
                  code={selectedQr.code}
                  subtitle={selectedQr.businessName || businessName}
                  size={220}
                  showActions={true}
                  path=""
                />
              </div>
            ) : (
              <div>
                <p className="text-xs text-center text-slate-500 mb-3">
                  📶 <strong>Tujuan:</strong> Akses Wi-Fi tamu. Pengunjung diarahkan membuka Google Review sebelum password Wi-Fi dapat dibuka.
                </p>
                <QRCodeViewer
                  code={selectedQr.code}
                  subtitle={`${selectedQr.businessName || businessName}: Wi-Fi`}
                  size={220}
                  showActions={true}
                  path="/wifi"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
