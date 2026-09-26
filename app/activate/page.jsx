import React from 'react';
import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Aktivasi Cobascan',
};

export default function ActivateIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aktivasi Perangkat</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Untuk mengaktifkan perangkat Cobascan baru, silakan <strong>scan kode QR</strong> yang ada pada akrilik menggunakan kamera HP Anda, atau ketikkan link yang tertera di bawah QR code.
          </p>
          <div className="space-y-3">
            <Link href="/login" className="block w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
