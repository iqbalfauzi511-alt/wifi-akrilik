import React from 'react';
import Link from 'next/link';
import { QrCode, PlusCircle } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getQrsByBusinessId, getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import CustomerQrTable from '@/components/customer/CustomerQrTable';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Perangkat Cobascan: Cobascan',
};

export default async function CustomerQrPage() {
  const session = await getCurrentSession();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Perangkat Cobascan (QR &amp; NFC)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {userBusinesses.length > 1
              ? `Daftar seluruh perangkat Cobascan yang aktif di ${userBusinesses.length} cabang bisnis Anda.`
              : `Daftar seluruh perangkat Cobascan yang aktif dan terhubung dengan ${business?.businessName || 'bisnis Anda'}.`}
          </p>
        </div>
      </div>

      {!business ? (
        <Card className="border-slate-200 bg-white p-8 text-center max-w-lg mx-auto mt-10">
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Akses Daftar Perangkat terkunci. Anda belum memindai perangkat Cobascan mana pun.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={`Total ${myQrs.length} Perangkat Cobascan`}
            subtitle="Setiap perangkat memiliki kode unik untuk scan kamera."
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
