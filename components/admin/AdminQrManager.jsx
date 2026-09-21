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
  Archive,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import { massGenerateQrAction, updateQrStatusAction } from '@/lib/actions/qr-actions';

export default function AdminQrManager({ initialQrs = [] }) {
  const router = useRouter();

  // State
  const [qrList, setQrList] = useState(initialQrs);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQr, setSelectedQr] = useState(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateQuantity, setGenerateQuantity] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Filtered and Searched QRs
  const filteredQrs = useMemo(() => {
    return qrList.filter((qr) => {
      const matchesStatus =
        statusFilter === 'all' || qr.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        qr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qr.businessName && qr.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [qrList, statusFilter, searchTerm]);

  // Mass Generate handler
  const handleMassGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setNotification(null);
    const formData = new FormData();
    formData.set('quantity', generateQuantity);

    const result = await massGenerateQrAction(formData);
    setIsGenerating(false);

    if (result?.success) {
      if (result.newQrs && result.newQrs.length > 0) {
        const mappedNew = result.newQrs.map((item) => ({
          ...item,
          businessName: null,
          ownerEmail: null,
          scanCount: 0,
        }));
        setQrList((prev) => [...mappedNew, ...prev]);
      }
      setIsGenerateOpen(false);
      setNotification({
        type: 'success',
        message: `Berhasil membuat ${result.count || generateQuantity} QR Code baru!`,
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
      const origin = window.location.origin;

      for (const qr of filteredQrs) {
        const targetUrl = `${origin}/q/${qr.code}`;
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
            Kelola inventori, cetak akrilik, dan pantau status seluruh QR platform.
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
            Generate QR Massal
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
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
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

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode QR atau nama bisnis..."
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
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Bisnis / Kafe</th>
                <th className="py-3.5 px-4 font-semibold text-center">Total Scan</th>
                <th className="py-3.5 px-4 font-semibold">Dibuat</th>
                <th className="py-3.5 px-4 font-semibold">Diaktifkan</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
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
        title="Generate QR Massal"
        description="Buat batch QR Code unik baru dengan status BLANK (belum terjual)."
      >
        <form onSubmit={handleMassGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Jumlah QR Code yang Dibuat:
            </label>
            <select
              value={generateQuantity}
              onChange={(e) => setGenerateQuantity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="5">5 QR Code (Uji Coba)</option>
              <option value="10">10 QR Code</option>
              <option value="25">25 QR Code</option>
              <option value="50">50 QR Code</option>
              <option value="100">100 QR Code (Batch Akrilik)</option>
              <option value="250">250 QR Code</option>
            </select>
            <p className="text-xs text-slate-400 mt-1.5">
              Setiap QR otomatis memiliki kode unik acak aman berformat <span className="font-mono">SW-XXXXXX</span>.
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

      {/* QR Preview & Download Modal */}
      <Modal
        isOpen={!!selectedQr}
        onClose={() => setSelectedQr(null)}
        title={`QR Code ${selectedQr?.code || ''}`}
        description={`Status: ${selectedQr?.status?.toUpperCase() || ''}`}
      >
        {selectedQr && (
          <div className="pt-2">
            <QRCodeViewer
              code={selectedQr.code}
              subtitle={selectedQr.businessName || 'Belum Terhubung ke Kafe'}
              size={220}
              showActions={true}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
