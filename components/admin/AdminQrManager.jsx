'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  RotateCcw,
  Archive,
  Layers,
  Check,
  Wifi,
  MapPin,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import {
  massGenerateQrAction,
  updateQrStatusAction,
  resetQrAction,
  resetBatchAction,
} from '@/lib/actions/qr-actions';

export default function AdminQrManager({ initialQrs = [] }) {
  const router = useRouter();

  // State
  const [qrList, setQrList] = useState(initialQrs);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [selectedQr, setSelectedQr] = useState(null);
  const [qrToReset, setQrToReset] = useState(null);
  const [batchToReset, setBatchToReset] = useState(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateQuantity, setGenerateQuantity] = useState('5');
  const [generateMode, setGenerateMode] = useState('batch'); // 'batch' | 'individual'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Synchronize when server updates initialQrs without wiping freshly created items
  useEffect(() => {
    if (Array.isArray(initialQrs)) {
      setQrList((prev) => {
        if (initialQrs.length > 0) return initialQrs;
        return prev.length > 0 ? prev : [];
      });
    }
  }, [initialQrs]);

  // Unique batches for filtering
  const availableBatches = useMemo(() => {
    const set = new Set();
    qrList.forEach((q) => {
      if (q.batchCode) set.add(q.batchCode);
    });
    return Array.from(set).sort();
  }, [qrList]);

  // Filtered and Searched QRs
  const filteredQrs = useMemo(() => {
    return qrList.filter((qr) => {
      const matchesStatus =
        statusFilter === 'all' || qr.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesBatch =
        batchFilter === 'all' || (qr.batchCode && qr.batchCode === batchFilter);
      const matchesSearch =
        !searchTerm.trim() ||
        qr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qr.batchCode && qr.batchCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (qr.businessName && qr.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesBatch && matchesSearch;
    });
  }, [qrList, statusFilter, batchFilter, searchTerm]);

  // Mass Generate handler (Creates 1 batch or individual QRs)
  const handleMassGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setNotification(null);
    const formData = new FormData();
    formData.set('quantity', generateQuantity);
    formData.set('mode', generateMode);

    const result = await massGenerateQrAction(formData);
    setIsGenerating(false);

    if (result?.success) {
      if (result.newQrs && result.newQrs.length > 0) {
        setQrList((prev) => [...result.newQrs, ...prev]);
      }
      setIsGenerateOpen(false);
      const successMsg =
        generateMode === 'individual'
          ? `Berhasil membuat ${result.count || generateQuantity} QR Code Satuan (Aktivasi Mandiri)!`
          : `Berhasil membuat Batch ${result.batch?.batchCode || ''} berisi ${result.count || generateQuantity} QR Code baru!`;
      setNotification({
        type: 'success',
        message: successMsg,
      });
      router.refresh();
    } else {
      const errorMsg = result?.error || 'Gagal generate QR';
      setNotification({
        type: 'error',
        message: errorMsg,
      });
      alert(errorMsg);
    }
  };

  // Status toggle handler
  const handleStatusChange = async (qrId, newStatus) => {
    setStatusUpdatingId(qrId);
    setQrList((prev) =>
      prev.map((item) => (item.id === qrId ? { ...item, status: newStatus } : item))
    );
    const result = await updateQrStatusAction(qrId, newStatus);
    setStatusUpdatingId(null);
    if (!result?.success) {
      setQrList(initialQrs);
      alert(result?.error || 'Gagal mengubah status');
    } else {
      router.refresh();
    }
  };

  // Reset single QR handler
  const handleConfirmResetQr = async () => {
    if (!qrToReset) return;
    try {
      setIsResetting(true);
      const targetId = qrToReset.id;
      const targetCode = qrToReset.code;

      // Optimistic update
      setQrList((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                status: 'blank',
                businessName: null,
                ownerEmail: null,
                activatedAt: null,
                soldAt: null,
              }
            : item
        )
      );

      const result = await resetQrAction(targetId);
      setIsResetting(false);
      setQrToReset(null);

      if (result?.success) {
        setNotification({
          type: 'success',
          message: `QR ${targetCode} berhasil di-reset ke status BLANK dan dapat digunakan kembali.`,
        });
        router.refresh();
      } else {
        setQrList(initialQrs);
        alert(result?.error || 'Gagal mereset QR');
      }
    } catch (err) {
      setIsResetting(false);
      setQrList(initialQrs);
      alert('Terjadi kendala saat mereset QR');
    }
  };

  // Reset entire Batch handler
  const handleConfirmResetBatch = async () => {
    if (!batchToReset) return;
    try {
      setIsResetting(true);
      const targetBatchId = batchToReset.batchId;
      const targetBatchCode = batchToReset.batchCode;

      // Optimistic update
      setQrList((prev) =>
        prev.map((item) =>
          item.batchId === targetBatchId
            ? {
                ...item,
                status: 'blank',
                businessName: null,
                ownerEmail: null,
                activatedAt: null,
                soldAt: null,
              }
            : item
        )
      );

      const result = await resetBatchAction(targetBatchId);
      setIsResetting(false);
      setBatchToReset(null);

      if (result?.success) {
        setNotification({
          type: 'success',
          message: `Seluruh QR dalam paket ${targetBatchCode} berhasil di-reset ke status BLANK.`,
        });
        router.refresh();
      } else {
        setQrList(initialQrs);
        alert(result?.error || 'Gagal mereset batch');
      }
    } catch (err) {
      setIsResetting(false);
      setQrList(initialQrs);
      alert('Terjadi kendala saat mereset batch');
    }
  };

  // Bulk ZIP Download handler
  const handleBulkDownload = async () => {
    if (filteredQrs.length === 0) {
      alert('Tidak ada QR untuk diunduh.');
      return;
    }

    try {
      setIsDownloadingZip(true);
      const zip = new JSZip();
      const folder = zip.folder('smartwifi-qr-codes');
      const appUrl =
        (typeof window !== 'undefined' && window.location.origin)
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('supabase.co')
              ? process.env.NEXT_PUBLIC_APP_URL
              : 'https://wifi-akrilik.vercel.app');
      const cleanOrigin = appUrl.replace(/\/$/, '');

      for (const qr of filteredQrs) {
        const targetUrl = `${cleanOrigin}/q/${qr.code}`;
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#0f172a', light: '#ffffff' },
        });

        // Strip data:image/png;base64,
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        folder.file(`${qr.code}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `smartwifi-qr-batch-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setIsDownloadingZip(false);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      alert('Gagal mendownload paket QR');
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen QR Code</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola paket batch QR, cetak akrilik, aktivasi, dan reset inventori platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            isLoading={isDownloadingZip}
            className="text-xs gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
            Download ZIP ({filteredQrs.length})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate QR Batch
          </Button>
        </div>
      </div>

      {/* Alert / Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
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
            className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-4 p-1 rounded-lg hover:bg-black/5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs & Batch Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1">
            {['all', 'blank', 'sold', 'active', 'disabled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Batch Filter Dropdown */}
          {availableBatches.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">Semua Batch</option>
                {availableBatches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {batchFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const firstMatch = qrList.find((q) => q.batchCode === batchFilter);
                    if (firstMatch) {
                      setBatchToReset({
                        batchId: firstMatch.batchId,
                        batchCode: batchFilter,
                      });
                    }
                  }}
                  className="text-[11px] py-1 px-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                  title="Reset semua QR di batch ini"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset Batch
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode QR, batch, atau bisnis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Table of QR Codes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Kode QR</th>
                <th className="py-3.5 px-4 font-semibold">Batch</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Bisnis / Kafe</th>
                <th className="py-3.5 px-3 font-semibold text-center">Maps</th>
                <th className="py-3.5 px-3 font-semibold text-center">Wi-Fi</th>
                <th className="py-3.5 px-4 font-semibold text-center">Total Scan</th>
                <th className="py-3.5 px-4 font-semibold">Dibuat</th>
                <th className="py-3.5 px-4 font-semibold">Diaktifkan</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQrs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                    Tidak ditemukan QR Code yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredQrs.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900">{qr.code}</span>
                    </td>

                    {/* Batch */}
                    <td className="py-3.5 px-4">
                      {qr.batchCode ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[11px] font-semibold">
                          {qr.batchCode}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                          Satuan
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge status={qr.status} />
                    </td>

                    {/* Business */}
                    <td className="py-3.5 px-4">
                      {qr.businessName ? (
                        <div>
                          <div className="font-semibold text-slate-900">{qr.businessName}</div>
                          {qr.ownerEmail && (
                            <div className="text-[11px] text-slate-400">{qr.ownerEmail}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Belum dihubungkan</span>
                      )}
                    </td>

                    {/* Google Maps Feature Status */}
                    <td className="py-3.5 px-3 text-center">
                      {(qr.googleMapsReviewUrl || qr.googleMapsUrl) ? (
                        <a
                          href={qr.googleMapsReviewUrl || qr.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors mx-auto"
                          title={`Review Google Maps: ${qr.googleMapsReviewUrl || qr.googleMapsUrl}`}
                        >
                          <span className="text-xs font-bold">✓</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>

                    {/* Wi-Fi Feature Status */}
                    <td className="py-3.5 px-3 text-center">
                      {qr.wifiEnabled ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-bold text-xs mx-auto"
                          title="Akses Wi-Fi Aktif"
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>

                    {/* Scans */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {qr.scanCount}
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(qr.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Activated */}
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {qr.activatedAt
                        ? new Date(qr.activatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedQr(qr)}
                          className="text-xs p-1.5"
                          title="Lihat / Unduh QR"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>

                        {/* Status Switcher Actions */}
                        {qr.status === 'blank' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={statusUpdatingId === qr.id}
                            onClick={() => handleStatusChange(qr.id, 'sold')}
                            className="text-[11px] py-1 px-2 text-amber-700 hover:bg-amber-50"
                          >
                            Set SOLD
                          </Button>
                        )}

                        {qr.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={statusUpdatingId === qr.id}
                            onClick={() => handleStatusChange(qr.id, 'disabled')}
                            className="text-[11px] py-1 px-2 text-rose-700 hover:bg-rose-50"
                          >
                            Disable
                          </Button>
                        )}

                        {qr.status === 'disabled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={statusUpdatingId === qr.id}
                            onClick={() => handleStatusChange(qr.id, 'active')}
                            className="text-[11px] py-1 px-2 text-emerald-700 hover:bg-emerald-50"
                          >
                            Activate
                          </Button>
                        )}

                        {/* Reset QR Button (For active, sold, or disabled QRs) */}
                        {(qr.status !== 'blank' || qr.businessName) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQrToReset(qr)}
                            className="text-[11px] py-1 px-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                            title="Reset QR ini ke status BLANK"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        )}

                        <a
                          href={`/q/${qr.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                          title="Buka halaman scan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mass QR Generator Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate QR Code Baru"
        description="Pilih tipe pembuatan QR Code dengan status BLANK (siap cetak/jual)."
      >
        <form onSubmit={handleMassGenerate} className="space-y-4">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tipe Pembuatan QR:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGenerateMode('batch')}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  generateMode === 'batch'
                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">📦 Paket (Batch)</span>
                  {generateMode === 'batch' && (
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  1 Paket untuk 1 Kafe. Aktivasi 1 QR otomatis mengaktifkan semua QR dalam paket.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGenerateMode('individual')}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  generateMode === 'individual'
                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">🏷️ Satuan (Mandiri)</span>
                  {generateMode === 'individual' && (
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Aktivasi 1 per 1. Setiap QR berdiri sendiri dan diaktivasi masing-masing (eceran).
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Jumlah QR Code:
            </label>
            <select
              value={generateQuantity}
              onChange={(e) => setGenerateQuantity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="5">5 QR Code</option>
              <option value="10">10 QR Code</option>
              <option value="25">25 QR Code</option>
              <option value="50">50 QR Code</option>
              <option value="100">100 QR Code</option>
              <option value="250">250 QR Code</option>
            </select>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {generateMode === 'batch'
                ? 'Sistem akan memberi kode batch (misal BATCH-001). 1 customer yang scan akan langsung mengaktifkan semua QR dalam batch ini.'
                : 'QR yang dibuat berdiri sendiri tanpa grup batch. Setiap QR harus diaktivasi secara terpisah.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsGenerateOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isGenerating}>
              Generate Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Single QR Confirmation Modal */}
      <Modal
        isOpen={!!qrToReset}
        onClose={() => setQrToReset(null)}
        title="Reset QR?"
        description="QR ini akan dilepaskan dari business saat ini dan dapat digunakan kembali."
      >
        {qrToReset && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              Kode QR <strong className="font-mono">{qrToReset.code}</strong> akan dikembalikan ke status <strong>BLANK</strong>. Tautan dengan bisnis <strong className="font-semibold">{qrToReset.businessName || 'sebelumnya'}</strong> akan dihapus. Record QR fisik tetap ada dan dapat langsung diaktivasi ulang oleh pemilik baru.
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isResetting}
                onClick={() => setQrToReset(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isResetting}
                onClick={handleConfirmResetQr}
              >
                Reset QR
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Entire Batch Confirmation Modal */}
      <Modal
        isOpen={!!batchToReset}
        onClose={() => setBatchToReset(null)}
        title="Reset Seluruh Batch?"
        description="Semua QR dalam batch ini akan dilepaskan dari bisnis dan dikembalikan ke status BLANK."
      >
        {batchToReset && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              Seluruh QR Code di dalam <strong className="font-mono">{batchToReset.batchCode}</strong> akan dikembalikan ke status <strong>BLANK</strong>. Record batch tetap tersimpan untuk riwayat inventori.
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isResetting}
                onClick={() => setBatchToReset(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isResetting}
                onClick={handleConfirmResetBatch}
              >
                Reset Batch
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Preview & Download Modal */}
      <Modal
        isOpen={!!selectedQr}
        onClose={() => setSelectedQr(null)}
        title={`QR Code ${selectedQr?.code || ''}`}
        description={`Batch: ${selectedQr?.batchCode || '-'} | Status: ${selectedQr?.status?.toUpperCase() || ''}`}
      >
        {selectedQr && (
          <div className="pt-2">
            <QRCodeViewer
              code={selectedQr.code}
              subtitle={selectedQr.businessName || `Batch ${selectedQr.batchCode || ''} — Siap Cetak`}
              size={220}
              showActions={true}
            />
            {(selectedQr.googleMapsReviewUrl || selectedQr.googleMapsUrl) && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="truncate max-w-[200px]">📍 <strong>Review Google Maps:</strong> Aktif</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedQr.wifiEnabled ? 'bg-brand-100 text-brand-800' : 'bg-slate-200 text-slate-600'}`}>
                  {selectedQr.wifiEnabled ? 'Wi-Fi ON' : 'Wi-Fi OFF'}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
