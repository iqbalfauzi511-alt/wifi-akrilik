import React from 'react';
import { getAllQrsAdmin } from '@/lib/db/queries/qr';
import AdminQrManager from '@/components/admin/AdminQrManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Cobascan: Cobascan Admin',
};

export default async function AdminQrPage() {
  const qrList = await getAllQrsAdmin();

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
      <AdminQrManager initialQrs={qrList} />
    </div>
  );
}
