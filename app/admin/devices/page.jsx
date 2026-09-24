import React from 'react';
import { getAllQrsAdmin, getAllBatchesAdmin } from '@/lib/db/queries/qr';
import AdminQrManager from '@/components/admin/AdminQrManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Perangkat: Cobascan Admin',
};

export default async function AdminDevicesPage() {
  const [qrList, batches] = await Promise.all([
    getAllQrsAdmin().catch(() => []),
    getAllBatchesAdmin().catch(() => []),
  ]);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
      <AdminQrManager initialQrs={qrList} initialBatches={batches} />
    </div>
  );
}
