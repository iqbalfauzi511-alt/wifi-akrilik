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
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  ToggleLeft,
  ToggleRight,
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
  deleteQrAction,
  deleteBatchAction,
  bulkUpdateQrStatusAction,
  bulkDeleteQrsAction,
  bulkResetQrsAction,
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

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkResetModal, setBulkResetModal] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState('active');
  const [qrToReset, setQrToReset] = useState(null);
  const [batchToReset, setBatchToReset] = useState(null);
  const [qrToDelete, setQrToDelete] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Handle Delete Single QR
  const handleDeleteQr = async () => {
    if (!qrToDelete) return;

    try {
      setIsDeleting(true);
      const targetId = qrToDelete.id;
      const targetCode = qrToDelete.code;

      const result = await deleteQrAction(targetId);
      setIsDeleting(false);
      setQrToDelete(null);

      if (result?.success) {
        setQrList((prev) => prev.filter((item) => item.id !== targetId));
        setNotification({
          type: 'success',
          message: `QR Code ${targetCode} berhasil dihapus permanen.`,
        });
        router.refresh();
      } else {
        alert(result?.error || 'Gagal menghapus QR');
      }
    } catch (err) {
      setIsDeleting(false);
      alert('Terjadi kendala saat menghapus QR');
    }
  };

  // Handle Delete Entire Batch
  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;

    try {
      setIsDeleting(true);
      const targetBatchId = batchToDelete.batchId;
      const targetBatchCode = batchToDelete.batchCode;

      const result = await deleteBatchAction(targetBatchId);
      setIsDeleting(false);
      setBatchToDelete(null);

      if (result?.success) {
        setQrList((prev) => prev.filter((item) => item.batchId !== targetBatchId && item.batchCode !== targetBatchCode));
        setBatchFilter('all');
        setNotification({
          type: 'success',
          message: `Batch ${targetBatchCode} beserta ${result.count || 0} QR di dalamnya berhasil dihapus permanen.`,
        });
        router.refresh();
      } else {
        alert(result?.error || 'Gagal menghapus batch');
      }
    } catch (err) {
      setIsDeleting(false);
      alert('Terjadi kendala saat menghapus batch');
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
      const folder = zip.folder('cobascan-qr-codes');
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
      a.download = `cobascan-qr-batch-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setIsDownloadingZip(false);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      alert('Gagal mendownload paket QR');
      setIsDownloadingZip(false);
    }
  };

  // Multi-select toggle helpers
  const allSelected = filteredQrs.length > 0 && selectedIds.size === filteredQrs.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredQrs.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQrs.map((q) => q.id)));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Bulk Status Change
  const handleBulkStatusChange = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkProcessing(true);
      const targetIds = Array.from(selectedIds);
      const result = await bulkUpdateQrStatusAction(targetIds, bulkNewStatus);
      setIsBulkProcessing(false);
      setBulkStatusModal(false);

      if (result?.success) {
        setQrList((prev) =>
          prev.map((q) => (selectedIds.has(q.id) ? { ...q, status: bulkNewStatus } : q))
        );
        setNotification({
          type: 'success',
          message: `Berhasil mengubah status ${result.count || targetIds.length} QR terpilih menjadi ${bulkNewStatus}.`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result?.error || 'Gagal mengubah status massal');
      }
    } catch (err) {
      setIsBulkProcessing(false);
      alert('Terjadi kesalahan saat mengubah status massal');
    }
  };

  // Handle Bulk Reset to Blank
  const handleBulkReset = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkProcessing(true);
      const targetIds = Array.from(selectedIds);
      const result = await bulkResetQrsAction(targetIds);
      setIsBulkProcessing(false);
      setBulkResetModal(false);

      if (result?.success) {
        setQrList((prev) =>
          prev.map((q) =>
            selectedIds.has(q.id)
              ? {
                  ...q,
                  status: 'blank',
                  businessId: null,
                  businessName: null,
                  ownerEmail: null,
                  activatedAt: null,
                }
              : q
          )
        );
        setNotification({
          type: 'success',
          message: `Berhasil mereset ${result.count || targetIds.length} QR terpilih ke status blank (tersedia).`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result?.error || 'Gagal mereset massal');
      }
    } catch (err) {
      setIsBulkProcessing(false);
      alert('Terjadi kesalahan saat mereset massal');
    }
  };

  // Handle Bulk Delete Permanently
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkProcessing(true);
      const targetIds = Array.from(selectedIds);
      const result = await bulkDeleteQrsAction(targetIds);
      setIsBulkProcessing(false);
      setBulkDeleteModal(false);

      if (result?.success) {
        setQrList((prev) => prev.filter((q) => !selectedIds.has(q.id)));
        setNotification({
          type: 'success',
          message: `Berhasil menghapus permanen ${result.count || targetIds.length} QR terpilih dari sistem.`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(result?.error || 'Gagal menghapus massal');
      }
    } catch (err) {
      setIsBulkProcessing(false);
      alert('Terjadi kesalahan saat menghapus massal');
    }
  };

  // Handle Bulk Zip Download for Selected
  const handleBulkZipSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsDownloadingZip(true);
      const zip = new JSZip();
      const folder = zip.folder('cobascan-qr-codes');
      const appUrl =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://wifi-akrilik.vercel.app';
      const cleanOrigin = appUrl.replace(/\/$/, '');

      const items = qrList.filter((q) => selectedIds.has(q.id));
      for (const qr of items) {
        const targetUrl = `${cleanOrigin}/q/${qr.code}`;
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        folder.file(`${qr.code}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Cobascan_Terpilih_${items.length}_QR.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setIsDownloadingZip(false);
      setNotification({
        type: 'success',
        message: `Berhasil mengunduh ZIP untuk ${items.length} QR Code terpilih.`,
      });
    } catch (err) {
      setIsDownloadingZip(false);
      alert('Gagal mengunduh ZIP');
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
                <div className="flex items-center gap-1.5">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const firstMatch = qrList.find((q) => q.batchCode === batchFilter);
                      if (firstMatch) {
                        setBatchToDelete({
                          batchId: firstMatch.batchId,
                          batchCode: batchFilter,
                        });
                      }
                    }}
                    className="text-[11px] py-1 px-2 text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                    title="Hapus seluruh paket batch ini dan QR di dalamnya"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Hapus Batch
                  </Button>
                </div>
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

      {/* Floating Batch Action Bar when items selected */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-black">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-slate-200">
              QR Code Dipilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => setBulkStatusModal(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-transparent py-1 px-3"
            >
              <ToggleRight className="w-3.5 h-3.5 mr-1" />
              Ubah Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={handleBulkZipSelected}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 py-1 px-3"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download ZIP
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => setBulkResetModal(true)}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white border-transparent py-1 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset ke Blank
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => setBulkDeleteModal(true)}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white border-transparent py-1 px-3"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Hapus Permanen
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table of QR Codes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
              <tr>
                {/* Checkbox Header */}
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
                  <td colSpan={11} className="py-12 text-center text-xs text-slate-400">
                    Tidak ditemukan QR Code yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredQrs.map((qr) => {
                  const isSelected = selectedIds.has(qr.id);
                  return (
                    <tr
                      key={qr.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-brand-50/50 hover:bg-brand-50/70' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Checkbox Column */}
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

                        {/* Delete QR Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQrToDelete(qr)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus QR Code permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Delete Single QR Confirmation Modal */}
      <Modal
        isOpen={!!qrToDelete}
        onClose={() => setQrToDelete(null)}
        title="Hapus QR Code Permanen"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        {qrToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">
                  Hapus QR Code {qrToDelete.code}?
                </p>
                <p className="mt-1 leading-relaxed text-rose-700">
                  Data kode QR ini akan dihapus secara permanen dari database, termasuk riwayat scan.
                  {qrToDelete.businessName && (
                    <span className="block mt-1 font-semibold">
                      Terkait dengan bisnis: {qrToDelete.businessName}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteQr}
              >
                Hapus QR Permanen
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Entire Batch Confirmation Modal */}
      <Modal
        isOpen={!!batchToDelete}
        onClose={() => setBatchToDelete(null)}
        title="Hapus Seluruh Batch"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        {batchToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">
                  Hapus Batch {batchToDelete.batchCode} beserta seluruh QR di dalamnya?
                </p>
                <p className="mt-1 leading-relaxed text-rose-700">
                  Semua QR code yang terdaftar di dalam paket batch ini akan dihapus secara permanen dari sistem.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBatchToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteBatch}
              >
                Hapus Seluruh Batch
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Bulk Status Update */}
      <Modal
        isOpen={bulkStatusModal}
        onClose={() => setBulkStatusModal(false)}
        title="Ubah Status QR Terpilih"
        description={`Terapkan status baru untuk ${selectedIds.size} QR code yang dipilih.`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Status Baru:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'blank', label: 'Tersedia (Blank)', desc: 'Siap cetak / dijual' },
                { id: 'sold', label: 'Terjual (Sold)', desc: 'Menunggu aktivasi' },
                { id: 'active', label: 'Aktif (Active)', desc: 'Aktif digunakan kafe' },
                { id: 'disabled', label: 'Nonaktif (Disabled)', desc: 'Dinonaktifkan sementara' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBulkNewStatus(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    bulkNewStatus === s.id
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{s.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkStatusModal(false)}
              disabled={isBulkProcessing}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={handleBulkStatusChange}
            >
              Terapkan ke {selectedIds.size} QR
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Bulk Reset to Blank */}
      <Modal
        isOpen={bulkResetModal}
        onClose={() => setBulkResetModal(false)}
        title="Reset QR Terpilih ke Blank?"
        description={`Konfirmasi reset untuk ${selectedIds.size} QR code.`}
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-900">
                Reset {selectedIds.size} QR ke status Blank (Kosong)?
              </p>
              <p className="mt-1 leading-relaxed text-amber-800">
                Hubungan QR dengan kafe/bisnis akan dilepas, status kembali menjadi Blank, dan siap diaktivasi ulang oleh bisnis baru. Kode fisik QR tetap tersimpan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkResetModal(false)}
              disabled={isBulkProcessing}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={handleBulkReset}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Ya, Reset {selectedIds.size} QR
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Bulk Delete Permanently */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Hapus Permanen QR Terpilih?"
        description={`Tindakan ini akan menghapus ${selectedIds.size} QR code dari database secara permanen.`}
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-900">
                Hapus {selectedIds.size} QR Code secara permanen?
              </p>
              <p className="mt-1 leading-relaxed text-rose-700">
                QR code yang terhapus beserta log scan-nya tidak dapat dikembalikan lagi.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteModal(false)}
              disabled={isBulkProcessing}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={handleBulkDelete}
            >
              Ya, Hapus {selectedIds.size} QR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
