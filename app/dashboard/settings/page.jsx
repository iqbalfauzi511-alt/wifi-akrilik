import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import SettingsForm from '@/components/customer/SettingsForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengaturan — Smart QR + NFC',
};

export default async function CustomerSettingsPage() {
  const session = await getCurrentSession();

  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const business = session?.business;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Smart QR + NFC</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola link Google Maps rating dan opsi akses Wi-Fi bisnis Anda.
        </p>
      </div>

      {!business ? (
        <Card className="p-8 text-center max-w-lg">
          <p className="text-sm text-slate-600 mb-4">
            Anda belum memiliki data bisnis. Silakan atur profil bisnis terlebih dahulu.
          </p>
          <Link href="/dashboard/setup">
            <Button size="sm">Atur Profil Bisnis</Button>
          </Link>
        </Card>
      ) : (
        <SettingsForm business={business} />
      )}
    </div>
  );
}
