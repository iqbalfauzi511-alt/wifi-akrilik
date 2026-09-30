import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { customerFeedback, qrCodes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCustomerStatsByUserId } from '@/lib/db/queries/stats';
import OwnerSettingsPage from '@/components/customer/OwnerSettingsPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Cobascan',
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
  const [userBusinesses, qrList, userStats] = userId
    ? await Promise.all([
        getBusinessesByOwnerId(userId).catch(() => []),
        getQrsByOwnerUserId(userId).catch(() => []),
        getCustomerStatsByUserId(userId).catch(() => ({})),
      ])
    : [(session?.businesses || []), [], {}];

  const business = userBusinesses[0] || session?.business;

  if (!business) {
    redirect('/dashboard/setup');
  }

  let feedbacks = [];
  if (business?.id) {
    feedbacks = await db
      .select({
        id: customerFeedback.id,
        rating: customerFeedback.rating,
        message: customerFeedback.message,
        customerName: customerFeedback.customerName,
        customerPhone: customerFeedback.customerPhone,
        createdAt: customerFeedback.createdAt,
        qrCode: qrCodes.code,
        deviceName: qrCodes.deviceName,
      })
      .from(customerFeedback)
      .leftJoin(qrCodes, eq(customerFeedback.qrId, qrCodes.id))
      .where(eq(customerFeedback.businessId, business.id))
      .orderBy(desc(customerFeedback.createdAt))
      .catch(() => []);
  }

  return (
    <OwnerSettingsPage
      business={business}
      businesses={userBusinesses}
      userEmail={session.user.email}
      userName={session.user.name}
      userWa={session.user.whatsappNumber}
      qrList={qrList}
      stats={userStats}
      feedbacks={feedbacks}
    />
  );
}
