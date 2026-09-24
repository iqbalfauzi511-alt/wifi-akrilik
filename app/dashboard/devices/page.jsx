import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TabletSmartphone, Plus, ArrowLeft } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import CustomerQrTable from '@/components/customer/CustomerQrTable';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Perangkat: Cobascan Pemilik Bisnis',
};

export default async function CustomerDevicesPage() {
  const session = await getCurrentSession();
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const [userBusinesses, myQrs] = userId
    ? await Promise.all([
        getBusinessesByOwnerId(userId).catch(() => []),
        getQrsByOwnerUserId(userId).catch(() => []),
      ])
    : [(session?.businesses || []), []];

  const business = userBusinesses[0] || session?.business || (myQrs.length > 0 ? {
    businessName: myQrs[0].businessName,
    wifiEnabled: myQrs[0].wifiEnabled,
  } : null);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            Perangkat Cobascan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Kelola stand akrilik QR Code &amp; NFC yang terpasang di meja bisnis Anda.
          </p>
        </div>

        <Link href="/dashboard/setup">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Aktivasi Stand Baru</span>
          </Button>
        </Link>
      </div>

      {!business ? (
        <Card className="border-slate-200 bg-white p-8 text-center max-w-lg mx-auto mt-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center mx-auto mb-4">
            <TabletSmartphone className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Perangkat Aktif</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Anda belum mengaktifkan perangkat Cobascan. Klik tombol di bawah untuk mendaftarkan stand akrilik pertama Anda.
          </p>
          <Link href="/dashboard/setup">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Aktivasi Sekarang
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="border-slate-200/90 shadow-xs">
          <CardHeader
            title={`Total ${myQrs.length} Perangkat Terpasang`}
            subtitle="Setiap meja memiliki kode unik untuk pemindaian kamera dan tap NFC pengunjung."
            action={
              <Link href="/dashboard/setup">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Perangkat
                </Button>
              </Link>
            }
          />

          <CustomerQrTable
            qrList={myQrs}
            businessName={business?.businessName}
            wifiEnabled={business?.wifiEnabled}
          />
        </Card>
      )}
    </div>
  );
}
