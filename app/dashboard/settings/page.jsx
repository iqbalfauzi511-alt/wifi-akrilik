import React from 'react';
import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth/session';
import SettingsForm from '@/components/customer/SettingsForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengaturan Wi-Fi — Smart Wi-Fi',
};

export default async function CustomerSettingsPage() {
  const session = await getCurrentSession();
  const business = session?.business;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Wi-Fi & Bisnis</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ubah nama Wi-Fi, password, atau akun Instagram bisnis Anda.
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
