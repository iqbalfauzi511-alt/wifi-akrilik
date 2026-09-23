import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import ActivationForm from '@/components/customer/ActivationForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Aktivasi Cobascan',
  description: 'Aktivasi stand akrilik Cobascan baru untuk meja bisnis Anda.',
};

export default async function BusinessSetupPage() {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect('/login?next=/dashboard/setup');
  }

  const userBusinesses = session?.user?.id
    ? await getBusinessesByOwnerId(session.user.id)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8">
      <ActivationForm
        initialBusiness={userBusinesses[0] || null}
        businesses={userBusinesses}
        userEmail={session?.user?.email}
      />
    </div>
  );
}
