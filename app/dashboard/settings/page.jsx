import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import SettingsForm from '@/components/customer/SettingsForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengaturan — Cobascan',
};

export default async function CustomerSettingsPage() {
  const session = await getCurrentSession();

  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userBusinesses = session?.user?.id
    ? await getBusinessesByOwnerId(session.user.id)
    : (session?.businesses || []);

  const business = userBusinesses[0] || session?.business;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Cobascan</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola link Google Review dan opsi akses Wi-Fi bisnis Anda secara terpisah per cabang/toko.
        </p>
      </div>

      {!business ? (
        <Card className="border-slate-200 bg-white p-8 text-center max-w-lg mx-auto mt-10">
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Akses Pengaturan terkunci. Anda harus memindai kode QR perangkat fisik Anda terlebih dahulu.
          </p>
        </Card>
      ) : (
        <SettingsForm
          business={business}
          businesses={userBusinesses}
        />
      )}
    </div>
  );
}
