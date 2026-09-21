'use client';

import React, { useState } from 'react';
import { ExternalLink, Eye, QrCode, Download } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import QRCodeViewer from '@/components/qr/QRCodeViewer';
import EmptyState from '@/components/ui/EmptyState';

export default function CustomerQrTable({ qrList = [], businessName }) {
  const [selectedQr, setSelectedQr] = useState(null);

  if (qrList.length === 0) {
    return (
      <EmptyState
        title="Belum Ada QR Terhubung"
        description="Scan QR Code fisik pada akrilik meja Anda untuk mengaktifkan dan menghubungkannya dengan kafe ini."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Kode QR</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-center">Total Scan</th>
              <th className="py-3.5 px-4 font-semibold">Tanggal Aktivasi</th>
              <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {qrList.map((qr) => (
              <tr key={qr.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-mono font-bold text-slate-900">{qr.code}</div>
                  <div className="text-[11px] text-slate-400">{businessName}</div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={qr.status} />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    {qr.scanCount} scan
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
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Preview & Download Modal */}
      <Modal
        isOpen={!!selectedQr}
        onClose={() => setSelectedQr(null)}
        title={`QR Code ${selectedQr?.code || ''}`}
        description={`Terhubung ke ${businessName || 'Bisnis Anda'}`}
      >
        {selectedQr && (
          <div className="pt-2">
            <QRCodeViewer
              code={selectedQr.code}
              subtitle={businessName}
              size={220}
              showActions={true}
            />
          </div>
        )}
      </Modal>
    </>
  );
}
