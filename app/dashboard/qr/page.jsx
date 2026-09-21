import React from 'react';
import Link from 'next/link';
import { QrCode, PlusCircle } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getQrsByBusinessId } from '@/lib/db/queries/qr';
import CustomerQrTable from '@/components/customer/CustomerQrTable';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'QR Code Saya — Smart Wi-Fi',
};

export default async function CustomerQrPage() {
  const session = await getCurrentSession();
  const business = session?.business;
  const myQrs = business ? await getQrsByBusinessId(business.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">QR Code Bisnis</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar seluruh QR Code akrilik yang aktif dan terhubung dengan {business?.businessName || 'bisnis Anda'}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`Total ${myQrs.length} QR Code`}
          subtitle="Setiap QR Code memiliki URL unik dan menghitung scan secara otomatis"
        />
        <CustomerQrTable qrList={myQrs} businessName={business?.businessName} />
      </Card>
    </div>
  );
}
