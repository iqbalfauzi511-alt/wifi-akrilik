import React from 'react';
import { getAllQrsAdmin } from '@/lib/db/queries/qr';
import AdminQrManager from '@/components/admin/AdminQrManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Cobascan: Cobascan Admin',
};

export default async function AdminQrPage() {
  const qrList = await getAllQrsAdmin();

  return <AdminQrManager initialQrs={qrList} />;
}
