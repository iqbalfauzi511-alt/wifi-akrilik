import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import SettingsForm from '@/components/customer/SettingsForm';
import Card, { CardHeader } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Setup Profil Bisnis — Smart QR + NFC',
};

export default async function BusinessSetupPage() {
  const session = await getCurrentSession();

  if (session?.role === 'admin') {
    redirect('/admin');
  }

  if (session?.business) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Lengkapi Profil Bisnis Anda
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Daftarkan informasi bisnis, link Google Maps review, dan fasilitas akses Wi-Fi Anda.
        </p>
      </div>

      <SettingsForm business={null} />
    </div>
  );
}
