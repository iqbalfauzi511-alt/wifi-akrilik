import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { ensureDatabaseInitialized } from '@/lib/db';
import OwnerSettingsPage from '@/components/customer/OwnerSettingsPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard — Cobascan',
};

export default async function CustomerDashboardPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();

  if (session?.role === 'admin') {
    redirect('/admin');
  }

  if (!session?.user) {
    redirect('/login?next=/dashboard');
  }

  const userId = session?.user?.id;
  const userBusinesses = userId
    ? await getBusinessesByOwnerId(userId).catch(() => [])
    : (session?.businesses || []);

  const business = userBusinesses[0] || session?.business;

  if (!business) {
    redirect('/dashboard/setup');
  }

  return (
    <OwnerSettingsPage
      business={business}
      businesses={userBusinesses}
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
