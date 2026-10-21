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
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Archive,
  Layers,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  ToggleRight,
  QrCode,
  Printer,
  Clock,
  Package,
  MoreHorizontal,
  Eye,
  PowerOff,
  ChevronDown,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import { generateQrWithLabelDataUrl } from '@/lib/utils/qr';
import {
  massGenerateQrAction,
  updateQrStatusAction,
  updateQrPrintStatusAction,
  bulkUpdateQrPrintStatusAction,
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
  const [printFilter, setPrintFilter] = useState('all'); // 'all' | 'unprinted' | 'printed'
  const [batchFilter, setBatchFilter] = useState('all');
  const [selectedQr, setSelectedQr] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkResetModal, setBulkResetModal] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState('active');
  const [qrToReset, setQrToReset] = useState(null);
  const [qrToDisable, setQrToDisable] = useState(null);
  const [mobileActionQr, setMobileActionQr] = useState(null);
  const [batchToReset, setBatchToReset] = useState(null);
  const [qrToDelete, setQrToDelete] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateQuantity, setGenerateQuantity] = useState('5');
  const [generateMode, setGenerateMode] = useState('batch'); // 'batch' | 'individual'
  const [generateError, setGenerateError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [printUpdatingId, setPrintUpdatingId] = useState(null);

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

  // Production and fleet lifecycle summary metrics
  const metrics = useMemo(() => {
    const total = qrList.length;
    const unprinted = qrList.filter((q) => !q.isPrinted).length;
    const readyStock = qrList.filter(
      (q) => q.isPrinted && (q.status === 'blank' || q.status === 'sold') && !q.businessName
    ).length;
    const activeDeployed = qrList.filter(
      (q) => q.status === 'active' || Boolean(q.businessName)
    ).length;
    return { total, unprinted, readyStock, activeDeployed };
  }, [qrList]);

  // Filtered and Searched QRs
  const filteredQrs = useMemo(() => {
    return qrList.filter((qr) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'blank' && (qr.status === 'blank' || qr.status === 'sold')) ||
        qr.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesBatch =
        batchFilter === 'all' || (qr.batchCode && qr.batchCode === batchFilter);
      const matchesPrint =
        printFilter === 'all' ||
        (printFilter === 'printed' && Boolean(qr.isPrinted)) ||
        (printFilter === 'unprinted' && !qr.isPrinted);
      const matchesSearch =
        !searchTerm.trim() ||
        qr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qr.batchCode && qr.batchCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (qr.businessName && qr.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesBatch && matchesPrint && matchesSearch;
    });
  }, [qrList, statusFilter, batchFilter, printFilter, searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, batchFilter, printFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQrs.length / itemsPerPage));
  const paginatedQrs = filteredQrs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mass Generate handler (Creates 1 batch or individual QRs)
  const handleMassGenerate = async (e) => {
    e.preventDefault();
    if (isGenerating) return; // Prevent double-click duplicate submission

    const qtyNum = Number(generateQuantity);
    if (!generateQuantity || isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum < 1) {
      setGenerateError('Jumlah QR harus berupa angka bulat minimal 1.');
      return;
    }
    if (qtyNum > 1000) {
      setGenerateError('Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit.');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setNotification(null);
    const formData = new FormData();
    formData.set('quantity', String(qtyNum));
    formData.set('mode', generateMode);

    const result = await massGenerateQrAction(formData);
    setIsGenerating(false);

    if (result?.success) {
      if (result.newQrs && result.newQrs.length > 0) {
        setQrList((prev) => [...result.newQrs, ...prev]);
      }
      setIsGenerateOpen(false);
      setGenerateError('');
      const successMsg =
        generateMode === 'individual'
          ? `Berhasil membuat ${result.count || generateQuantity} QR Code Satuan (Aktivasi Mandiri)!`
          : `Berhasil membuat Batch ${result.batch?.batchCode || ''} berisi ${result.count || generateQuantity} QR Code baru!`;
      setNotification({
        type: 'success',
        message: successMsg,
      });
    } else {
      const errorMsg = result?.error || 'Gagal generate QR';
      setGenerateError(errorMsg);
      setNotification({
        type: 'error',
        message: errorMsg,
      });
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

  // Physical print status toggle handler
  const handleTogglePrintStatus = async (qrId, nextIsPrinted) => {
    setPrintUpdatingId(qrId);
    setQrList((prev) =>
      prev.map((item) =>
        item.id === qrId
          ? {
              ...item,
              isPrinted: nextIsPrinted,
              printedAt: nextIsPrinted ? new Date().toISOString() : null,
            }
          : item
      )
    );

    const result = await updateQrPrintStatusAction(qrId, nextIsPrinted);
    setPrintUpdatingId(null);

    if (!result?.success) {
      setQrList(initialQrs);
      setNotification({
        type: 'error',
        message: result?.error || 'Gagal mengubah status cetak',
      });
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

  // Single QR PNG Download with label
  const handleDownloadSinglePng = async (qr) => {
    if (!qr?.code) return;
    try {
      const appUrl =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://cobascan.my.id';
      const cleanOrigin = appUrl.replace(/\/$/, '');
      const targetUrl = `${cleanOrigin}/q/${qr.code}`;
      const dataUrl = await generateQrWithLabelDataUrl(qr.code, targetUrl, { width: 1000 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${qr.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mendownload QR code');
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
              : 'https://cobascan.my.id');
      const cleanOrigin = appUrl.replace(/\/$/, '');

      for (const qr of filteredQrs) {
        const targetUrl = `${cleanOrigin}/q/${qr.code}`;
        const dataUrl = await generateQrWithLabelDataUrl(qr.code, targetUrl, { width: 1000 });

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
  const allSelected = paginatedQrs.length > 0 && paginatedQrs.every((q) => selectedIds.has(q.id));
  const isIndeterminate = paginatedQrs.some((q) => selectedIds.has(q.id)) && !allSelected;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedQrs.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedQrs.forEach((q) => next.add(q.id));
        return next;
      });
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

  // Handle Bulk Print Status
  const handleBulkPrintStatus = async (targetIsPrinted) => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkProcessing(true);
      const targetIds = Array.from(selectedIds);
      setQrList((prev) =>
        prev.map((q) =>
          selectedIds.has(q.id)
            ? {
                ...q,
                isPrinted: targetIsPrinted,
                printedAt: targetIsPrinted ? new Date().toISOString() : null,
              }
            : q
        )
      );

      const result = await bulkUpdateQrPrintStatusAction(targetIds, targetIsPrinted);
      setIsBulkProcessing(false);

      if (result?.success) {
        setNotification({
          type: 'success',
          message: `${result.count || targetIds.length} QR berhasil ditandai sebagai ${
            targetIsPrinted ? 'Sudah Cetak' : 'Belum Cetak'
          }.`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        setQrList(initialQrs);
        setNotification({
          type: 'error',
          message: result?.error || 'Gagal memperbarui status cetak massal',
        });
      }
    } catch (err) {
      setIsBulkProcessing(false);
      setQrList(initialQrs);
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan saat mengubah status cetak massal',
      });
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
          : 'https://cobascan.my.id';
      const cleanOrigin = appUrl.replace(/\/$/, '');

      const items = qrList.filter((q) => selectedIds.has(q.id));
      for (const qr of items) {
        const targetUrl = `${cleanOrigin}/q/${qr.code}`;
        const dataUrl = await generateQrWithLabelDataUrl(qr.code, targetUrl, { width: 1000 });
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
    <div className="space-y-4 sm:space-y-5">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h1 className="text-[22px] sm:text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            Manajemen QR Code
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-1.5">
            Kelola paket batch QR, cetak akrilik, dan aktivasi perangkat.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            isLoading={isDownloadingZip}
            className="h-8.5 sm:h-9 text-xs font-semibold gap-1.5 px-3 sm:px-3.5 justify-center rounded-xl shadow-2xs active:scale-95"
          >
            <Archive className="w-3.5 h-3.5 shrink-0 text-slate-600" />
            <span className="truncate">Unduh ZIP ({filteredQrs.length})</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setGenerateError('');
              setIsGenerateOpen(true);
            }}
            data-testid="admin-qr-generate-button"
            className="h-8.5 sm:h-9 text-xs font-semibold gap-1.5 px-3 sm:px-3.5 justify-center rounded-xl shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">+ Buat Batch</span>
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

      {/* Production & Hardware Fleet Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Total Hardware */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            setPrintFilter('all');
          }}
          className={`min-h-[90px] sm:min-h-[96px] p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
            statusFilter === 'all' && printFilter === 'all'
              ? 'border-slate-800 bg-slate-50/80 shadow-2xs'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-[10.5px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight break-words">
              Total Hardware
            </div>
          </div>
          <div>
            <div className="text-[22px] sm:text-2xl font-black text-slate-900 leading-none">
              {metrics.total}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-1 truncate">
              Semua stand akrilik
            </div>
          </div>
        </button>

        {/* 2. Antrean Cetak */}
        <button
          type="button"
          onClick={() => {
            setPrintFilter('unprinted');
            setStatusFilter('all');
          }}
          className={`min-h-[90px] sm:min-h-[96px] p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
            printFilter === 'unprinted' && statusFilter === 'all'
              ? 'border-amber-500 bg-amber-50/40 shadow-2xs'
              : 'border-slate-200/80 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-[10.5px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight break-words">
              Antrean Cetak
            </div>
          </div>
          <div>
            <div className="text-[22px] sm:text-2xl font-black text-slate-900 leading-none">
              {metrics.unprinted}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-1 truncate">
              Belum cetak fisik
            </div>
          </div>
        </button>

        {/* 3. Siap di Gudang */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('blank');
            setPrintFilter('printed');
          }}
          className={`min-h-[90px] sm:min-h-[96px] p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
            statusFilter === 'blank' && printFilter === 'printed'
              ? 'border-purple-500 bg-purple-50/40 shadow-2xs'
              : 'border-slate-200/80 bg-white hover:border-purple-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-[10.5px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight break-words">
              Siap Gudang
            </div>
          </div>
          <div>
            <div className="text-[22px] sm:text-2xl font-black text-slate-900 leading-none">
              {metrics.readyStock}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-1 truncate">
              Siap kirim / pairing
            </div>
          </div>
        </button>

        {/* 4. Aktif Terpasang */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('active');
            setPrintFilter('all');
          }}
          className={`min-h-[90px] sm:min-h-[96px] p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between active:scale-[0.98] ${
            statusFilter === 'active' && printFilter === 'all'
              ? 'border-emerald-500 bg-emerald-50/40 shadow-2xs'
              : 'border-slate-200/80 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-[10.5px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight break-words">
              Aktif Mitra
            </div>
          </div>
          <div>
            <div className="text-[22px] sm:text-2xl font-black text-slate-900 leading-none">
              {metrics.activeDeployed}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-1 truncate">
              Di meja mitra
            </div>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Desktop Layout (single horizontal line) */}
        <div className="hidden lg:flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'blank', label: 'Tersedia' },
                { id: 'active', label: 'Aktif' },
                { id: 'disabled', label: 'Off' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`h-7.5 px-3 rounded-md text-xs font-semibold tracking-tight transition-all text-center flex items-center justify-center ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-slate-200" />

            {/* Desktop Print Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => setPrintFilter('all')}
                className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all text-center flex items-center justify-center ${
                  printFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Cetak
              </button>
              <button
                type="button"
                onClick={() => setPrintFilter('unprinted')}
                className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all text-center flex items-center justify-center ${
                  printFilter === 'unprinted'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Belum Cetak
              </button>
              <button
                type="button"
                onClick={() => setPrintFilter('printed')}
                className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all text-center flex items-center justify-center ${
                  printFilter === 'printed'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sudah Cetak
              </button>
            </div>

            {/* Desktop Batch Dropdown */}
            {availableBatches.length > 0 && (
              <>
                <div className="w-px h-5 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="h-7 text-[11px] font-medium text-slate-700 pl-7 pr-6 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs appearance-none cursor-pointer"
                    >
                      <option value="all">Semua Batch</option>
                      {availableBatches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                  </div>

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
                        className="h-7.5 text-[11px] py-0.5 px-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                        title="Reset semua QR di batch ini"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
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
                        className="h-7.5 text-[11px] py-0.5 px-2 text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                        title="Hapus seluruh paket batch ini dan QR di dalamnya"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Desktop Search Input */}
          <div className="w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode QR, batch, bisnis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 h-8.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors shadow-2xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mobile / Tablet Layout (3 structured rows) */}
        <div className="lg:hidden flex flex-col gap-2">
          {/* Row 1: Fleet Status Segmented Control / Chips */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'blank', label: 'Tersedia' },
              { id: 'active', label: 'Aktif' },
              { id: 'disabled', label: 'Off' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 min-w-[56px] h-7.5 px-2 rounded-md text-xs font-medium transition-all text-center flex items-center justify-center shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 2: Physical Print Status Segmented Control with clear labels */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'Semua Cetak' },
              { id: 'unprinted', label: 'Belum Cetak' },
              { id: 'printed', label: 'Sudah Cetak' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPrintFilter(tab.id)}
                className={`flex-1 min-w-[76px] h-7.5 px-2 rounded-md text-xs font-medium transition-all text-center flex items-center justify-center shrink-0 ${
                  printFilter === tab.id
                    ? tab.id === 'printed'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : tab.id === 'unprinted'
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 3: Batch Filter & Search Bar */}
          <div className="flex items-center gap-2">
            {availableBatches.length > 0 && (
              <div className="relative shrink-0">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="h-8 text-[11px] font-medium text-slate-700 pl-2.5 pr-6 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs appearance-none cursor-pointer max-w-[125px] sm:max-w-[150px] truncate"
                >
                  <option value="all">Semua Batch</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kode QR, batch, bisnis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 h-8 text-[11px] rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors shadow-2xs placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Mobile Batch Action Buttons (only visible if batch filtered) */}
          {batchFilter !== 'all' && (
            <div className="flex items-center gap-2 pt-0.5 w-full">
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
                className="h-7 text-[11px] py-1 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 justify-center rounded-lg"
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
                className="h-7 text-[11px] py-1 px-2.5 text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 flex-1 justify-center rounded-lg"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Hapus Batch
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Batch Action Bar when items selected */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-4 sm:right-4 lg:static lg:bottom-auto lg:left-auto lg:right-auto z-50 p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-2xl lg:shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-black">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-slate-200">
                QR Dipilih
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="lg:hidden text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 transition-colors"
            >
              Batal
            </button>
          </div>

          <div className="flex items-center overflow-x-auto w-full lg:w-auto gap-2 pb-1 lg:pb-0 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => handleBulkPrintStatus(true)}
              className="shrink-0 min-h-[38px] text-xs !bg-emerald-600 hover:!bg-emerald-700 !text-white !border-transparent py-1.5 px-3 shadow-none active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Tandai Dicetak
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => handleBulkPrintStatus(false)}
              className="shrink-0 min-h-[38px] text-xs !bg-slate-700 hover:!bg-slate-600 !text-slate-200 !border-slate-600 py-1.5 px-3 shadow-none active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Tandai Belum Cetak
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => setBulkStatusModal(true)}
              className="shrink-0 min-h-[38px] text-xs !bg-indigo-600 hover:!bg-indigo-700 !text-white !border-transparent py-1.5 px-3 shadow-none active:scale-95"
            >
              <ToggleRight className="w-3.5 h-3.5 mr-1.5" />
              Ubah Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={handleBulkZipSelected}
              className="shrink-0 min-h-[38px] text-xs !bg-slate-800 hover:!bg-slate-700 !text-slate-200 !border-slate-700 py-1.5 px-3 shadow-none active:scale-95"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download ZIP
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => setBulkResetModal(true)}
              className="shrink-0 text-xs !bg-amber-600 hover:!bg-amber-700 !text-white !border-transparent py-1.5 px-3 shadow-none"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset ke Blank
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkProcessing}
              onClick={() => setBulkDeleteModal(true)}
              className="shrink-0 text-xs !bg-rose-600 hover:!bg-rose-700 !text-white !border-transparent py-1.5 px-3 shadow-none"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Hapus Permanen
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="hidden lg:block shrink-0 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 transition-colors ml-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table of QR Codes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
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
                <th className="py-3 px-4 font-semibold font-mono text-[10px]">HARDWARE CODE</th>
                <th className="py-3 px-3 font-semibold font-mono text-[10px] whitespace-nowrap">BATCH ID</th>
                <th className="py-3 px-3 font-semibold font-mono text-[10px]">FLEET STATUS</th>
                <th className="py-3 px-3 font-semibold font-mono text-[10px] whitespace-nowrap">STATUS CETAK</th>
                <th className="py-3 px-4 font-semibold font-mono text-[10px]">ASSIGNED PARTNER</th>
                <th className="py-3 px-3 font-semibold font-mono text-[10px] text-center">SCANS</th>
                <th className="py-3 px-3 font-semibold font-mono text-[10px]">CREATED DATE</th>
                <th className="py-3 px-4 font-semibold font-mono text-[10px] text-right">HARDWARE ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQrs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Tidak ditemukan QR Code yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                paginatedQrs.map((qr) => {
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

                      {/* Hardware Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-mono font-bold text-slate-900 text-xs">{qr.code}</span>
                        </div>
                      </td>

                      {/* Batch ID */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {qr.batchCode ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 border border-slate-200/80 font-mono text-[10px] font-medium whitespace-nowrap">
                            <Layers className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{qr.batchCode}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-200/60 font-mono text-[9.5px] whitespace-nowrap">
                            <Layers className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <span>SINGLE</span>
                          </span>
                        )}
                      </td>

                      {/* Fleet Status Pill */}
                      <td className="py-3 px-3">
                        {qr.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                        {(qr.status === 'blank' || qr.status === 'sold') && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Available
                          </span>
                        )}
                        {qr.status === 'disabled' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Physical Print Status Column */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={printUpdatingId === qr.id}
                          onClick={() => handleTogglePrintStatus(qr.id, !qr.isPrinted)}
                          title="Klik untuk mengubah status cetak fisik"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-all hover:shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                            qr.isPrinted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100/80'
                              : 'bg-amber-50/80 text-amber-700 border-amber-200/80 hover:bg-amber-100/80'
                          }`}
                        >
                          {qr.isPrinted ? (
                            <Printer className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          )}
                          <span className="leading-none">{qr.isPrinted ? 'Sudah Cetak' : 'Belum Cetak'}</span>
                        </button>
                      </td>

                      {/* Assigned Partner */}
                      <td className="py-3 px-4">
                        {qr.businessName ? (
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{qr.businessName}</div>
                            <div className="text-[10px] text-slate-400">
                              {qr.deviceName ? `📍 ${qr.deviceName}` : 'Lokasi Utama'}
                            </div>
                          </div>
                        ) : qr.isPrinted ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200/70 text-purple-800 text-[11px] font-medium">
                            <Package className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>Stok Gudang (Siap Kirim)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-200/70 text-amber-800 text-[11px] font-medium">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Antrean Cetak</span>
                          </span>
                        )}
                      </td>

                      {/* Scans */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-slate-900 text-xs">{qr.scanCount}</span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 text-xs text-slate-500 font-mono">
                        {new Date(qr.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Hardware Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedQr(qr)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                          >
                            Preview
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSinglePng(qr)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                          >
                            Download
                          </button>

                          {(qr.status !== 'blank' || qr.businessName) && (
                            <button
                              type="button"
                              onClick={() => setQrToReset(qr)}
                              className="px-2 py-1 rounded-md text-[11px] font-semibold border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors shadow-2xs"
                            >
                              Reset
                            </button>
                          )}

                          {qr.status === 'active' && (
                            <button
                              type="button"
                              disabled={statusUpdatingId === qr.id}
                              onClick={() => setQrToDisable(qr)}
                              className="px-2 py-1 rounded-md text-[11px] font-semibold border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 transition-colors shadow-2xs"
                            >
                              Disable
                            </button>
                          )}

                          {qr.status === 'disabled' && (
                            <button
                              type="button"
                              disabled={statusUpdatingId === qr.id}
                              onClick={() => handleStatusChange(qr.id, 'active')}
                              className="px-2 py-1 rounded-md text-[11px] font-semibold border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-2xs"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden flex flex-col divide-y divide-slate-100">
          {/* Mobile Select All Header */}
          {paginatedQrs.length > 0 && (
            <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="p-1 -ml-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4.5 h-4.5 text-brand-600" />
                  ) : isIndeterminate ? (
                    <MinusSquare className="w-4.5 h-4.5 text-brand-600" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-slate-400" />
                  )}
                </button>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Pilih Semua
                </span>
              </div>
              {selectedIds.size > 0 && (
                <span className="text-[11px] font-semibold text-brand-600">
                  {selectedIds.size} dipilih
                </span>
              )}
            </div>
          )}

          {paginatedQrs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ditemukan QR Code yang cocok dengan filter atau pencarian.
            </div>
          ) : (
            paginatedQrs.map((qr) => {
              const isSelected = selectedIds.has(qr.id);
              return (
                <div
                  key={qr.id}
                  className={`p-3 transition-colors flex flex-col gap-2 ${
                    isSelected ? 'bg-brand-50/35' : 'bg-white'
                  }`}
                >
                  {/* 1. Bagian Atas: Checkbox, Hardware Code, dan Fleet Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(qr.id)}
                        className="p-1 -ml-1 rounded text-slate-400 hover:text-slate-600 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4.5 h-4.5 text-brand-600" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-300" />
                        )}
                      </button>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <QrCode className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                          {qr.code}
                        </span>
                      </div>
                    </div>

                    {/* Fleet Status Badge */}
                    <div className="shrink-0">
                      {qr.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      )}
                      {(qr.status === 'blank' || qr.status === 'sold') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Available
                        </span>
                      )}
                      {qr.status === 'disabled' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Bagian Tengah: Batch ID dan Status Cetak */}
                  <div className="flex items-center justify-between gap-2 pl-6">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {qr.batchCode ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 border border-slate-200/80 truncate max-w-[155px]">
                          <Layers className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{qr.batchCode}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200/60">
                          <Layers className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>SINGLE</span>
                        </span>
                      )}
                    </div>

                    {/* Status Cetak Button */}
                    <button
                      type="button"
                      disabled={printUpdatingId === qr.id}
                      onClick={() => handleTogglePrintStatus(qr.id, !qr.isPrinted)}
                      title="Klik untuk ubah status cetak"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors shrink-0 whitespace-nowrap ${
                        qr.isPrinted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100'
                          : 'bg-amber-50/80 text-amber-700 border-amber-200/80 hover:bg-amber-100/70'
                      }`}
                    >
                      {qr.isPrinted ? (
                        <Printer className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      )}
                      <span>{qr.isPrinted ? 'Sudah Cetak' : 'Belum Cetak'}</span>
                    </button>
                  </div>

                  {/* 3. Bagian Bawah: Partner, Scan, Tanggal, dan Action Menu */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80 pl-6">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {qr.businessName ? (
                          <span>
                            {qr.businessName}
                            {qr.deviceName && (
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                • {qr.deviceName}
                              </span>
                            )}
                          </span>
                        ) : qr.isPrinted ? (
                          <span className="text-purple-800 font-medium text-[11px] flex items-center gap-1">
                            <Package className="w-3 h-3 text-purple-600 shrink-0" />
                            Stok Gudang (Siap Kirim)
                          </span>
                        ) : (
                          <span className="text-amber-800 font-medium text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            Antrean Cetak
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                        <span>{qr.scanCount} scans</span>
                        <span>•</span>
                        <span>
                          {new Date(qr.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* 4. Action: Tombol Lainnya */}
                    <button
                      type="button"
                      onClick={() => setMobileActionQr(qr)}
                      className="h-7 px-2 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 shrink-0 shadow-2xs active:scale-95"
                    >
                      <span>Aksi</span>
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 px-4 py-3 border-t border-slate-200/80 bg-slate-50">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredQrs.length)}</span> dari <span className="font-semibold text-slate-700">{filteredQrs.length}</span> QR Code
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="text-xs py-1 px-2.5 h-auto shadow-none bg-white"
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
                className="text-xs py-1 px-2.5 h-auto shadow-none bg-white"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mass QR Generator Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate QR Code Baru"
        description="Pilih tipe pembuatan QR Code dengan status BLANK (siap cetak/jual)."
      >
        <form onSubmit={handleMassGenerate} noValidate className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Jumlah QR Code:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Bebas (1 - 1.000)</span>
            </div>

            <div className="relative">
              <input
                name="quantity"
                data-testid="admin-qr-quantity-input"
                type="number"
                min="1"
                max="1000"
                step="1"
                required
                value={generateQuantity}
                onChange={(e) => {
                  setGenerateQuantity(e.target.value);
                  setGenerateError('');
                }}
                placeholder="Masukkan jumlah (misal: 1, 7, 13, 50)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              {generateError && (
                <p className="mt-1.5 text-xs text-rose-600 font-semibold">{generateError}</p>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Preset Cepat:</span>
              {[1, 2, 3, 7, 10, 13, 25, 50, 100, 500].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setGenerateQuantity(String(qty))}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    generateQuantity === String(qty)
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {generateMode === 'batch'
                ? 'Sistem akan membuat 1 batch khusus berisi tepat jumlah QR ini. Saat customer mengaktifkan 1 unit dari paket ini, seluruh unit lain dalam batch otomatis ikut terdaftar di akunnya.'
                : 'QR yang dibuat berdiri sendiri tanpa grup batch. Setiap unit diaktivasi 1 per 1 secara terpisah.'}
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
        description={`Batch: ${selectedQr?.batchCode || '-'} | Status: ${selectedQr?.status === 'sold' ? 'AVAILABLE' : selectedQr?.status?.toUpperCase()} | Cetak: ${selectedQr?.isPrinted ? 'Sudah Cetak' : 'Belum Cetak'}`}
      >
        {selectedQr && (
          <div className="pt-2">
            <QRCodeViewer
              code={selectedQr.code}
              subtitle={
                selectedQr.businessName ||
                (selectedQr.isPrinted ? 'Siap di Gudang (Tersedia)' : 'Antrean Cetak Fisik')
              }
              size={220}
              showActions={true}
            />

            <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Status Cetak Fisik:</span>
              <button
                type="button"
                onClick={async () => {
                  const nextState = !selectedQr.isPrinted;
                  setSelectedQr((prev) => ({ ...prev, isPrinted: nextState }));
                  await handleTogglePrintStatus(selectedQr.id, nextState);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  selectedQr.isPrinted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {selectedQr.isPrinted ? (
                  <Printer className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span>{selectedQr.isPrinted ? 'Sudah Cetak' : 'Belum Cetak'}</span>
              </button>
            </div>

            {(selectedQr.googleMapsReviewUrl || selectedQr.googleMapsUrl) && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
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
                { id: 'blank', label: 'Tersedia (Blank)', desc: 'Siap diaktivasi mitra' },
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

      {/* Disable Single QR Confirmation Modal */}
      <Modal
        isOpen={!!qrToDisable}
        onClose={() => setQrToDisable(null)}
        title="Nonaktifkan Perangkat?"
        description="Perangkat ini akan dinonaktifkan sementara dan scan wifi tidak dapat digunakan."
      >
        {qrToDisable && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
              Kode QR <strong className="font-mono">{qrToDisable.code}</strong> milik mitra{' '}
              <strong className="font-semibold">{qrToDisable.businessName || 'sebelumnya'}</strong>{' '}
              akan diubah statusnya menjadi <strong>Disabled</strong>. Anda dapat mengaktifkannya kembali kapan saja.
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={statusUpdatingId === qrToDisable.id}
                onClick={() => setQrToDisable(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={statusUpdatingId === qrToDisable.id}
                onClick={async () => {
                  const targetId = qrToDisable.id;
                  setQrToDisable(null);
                  await handleStatusChange(targetId, 'disabled');
                }}
              >
                Nonaktifkan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mobile Device Actions Modal */}
      <Modal
        isOpen={!!mobileActionQr}
        onClose={() => setMobileActionQr(null)}
        title={`Aksi: ${mobileActionQr?.code || ''}`}
        description={
          mobileActionQr?.businessName
            ? `Mitra: ${mobileActionQr.businessName}${mobileActionQr.deviceName ? ` (${mobileActionQr.deviceName})` : ''}`
            : mobileActionQr?.isPrinted
              ? 'Perangkat Siap di Gudang (Siap Kirim)'
              : 'Perangkat Belum Dicetak (Antrean Cetak)'
        }
      >
        {mobileActionQr && (
          <div className="space-y-2 pt-1 pb-1">
            {/* 1. Preview */}
            <button
              type="button"
              onClick={() => {
                const target = mobileActionQr;
                setMobileActionQr(null);
                setSelectedQr(target);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors active:scale-[0.99] text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">Lihat Preview QR</div>
                <div className="text-[10.5px] text-slate-400 font-normal">Tampilkan QR code dan stiker visual</div>
              </div>
            </button>

            {/* 2. Download PNG */}
            <button
              type="button"
              onClick={() => {
                const target = mobileActionQr;
                setMobileActionQr(null);
                handleDownloadSinglePng(target);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors active:scale-[0.99] text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">Unduh PNG</div>
                <div className="text-[10.5px] text-slate-400 font-normal">Simpan file resolusi tinggi untuk cetak</div>
              </div>
            </button>

            {/* 3. Status Cetak */}
            <button
              type="button"
              onClick={async () => {
                const target = mobileActionQr;
                setMobileActionQr(null);
                await handleTogglePrintStatus(target.id, !target.isPrinted);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors active:scale-[0.99] text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">
                  {mobileActionQr.isPrinted ? 'Tandai Belum Cetak' : 'Tandai Sudah Cetak'}
                </div>
                <div className="text-[10.5px] text-slate-400 font-normal">
                  Status cetak fisik akrilik
                </div>
              </div>
            </button>

            {/* 4. Disable / Activate */}
            {mobileActionQr.status === 'active' && (
              <button
                type="button"
                onClick={() => {
                  const target = mobileActionQr;
                  setMobileActionQr(null);
                  setQrToDisable(target);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-medium transition-colors active:scale-[0.99] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <PowerOff className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-rose-900">Nonaktifkan (Disable)</div>
                  <div className="text-[10.5px] text-rose-500 font-normal">Hentikan sementara akses wifi</div>
                </div>
              </button>
            )}

            {mobileActionQr.status === 'disabled' && (
              <button
                type="button"
                onClick={async () => {
                  const target = mobileActionQr;
                  setMobileActionQr(null);
                  await handleStatusChange(target.id, 'active');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-700 text-xs font-medium transition-colors active:scale-[0.99] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-emerald-900">Aktifkan (Activate)</div>
                  <div className="text-[10.5px] text-emerald-600 font-normal">Buka kembali akses landing page wifi</div>
                </div>
              </button>
            )}

            {/* 5. Reset QR */}
            {(mobileActionQr.status !== 'blank' || mobileActionQr.businessName) && (
              <button
                type="button"
                onClick={() => {
                  const target = mobileActionQr;
                  setMobileActionQr(null);
                  setQrToReset(target);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-medium transition-colors active:scale-[0.99] text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-rose-700">Reset Perangkat</div>
                  <div className="text-[10.5px] text-slate-400 font-normal">Lepas tautan mitra dan kembalikan ke BLANK</div>
                </div>
              </button>
            )}

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center h-8 text-xs font-medium rounded-lg"
                onClick={() => setMobileActionQr(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
