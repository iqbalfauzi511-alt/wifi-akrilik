import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { getQrsByOwnerUserId } from '@/lib/db/queries/qr';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { scanLogs, customerFeedback, qrCodes } from '@/lib/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import OwnerDashboardView from '@/components/customer/OwnerDashboardView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard: Cobascan Pemilik Bisnis',
};

export default async function CustomerDashboardPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();

  // Admin manages the platform at /admin
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const userBusinesses = userId
    ? await getBusinessesByOwnerId(userId).catch(() => [])
    : (session?.businesses || []);

  const business = userBusinesses[0] || session?.business;

  // Fetch this owner's QRs
  const myQrs = userId
    ? await getQrsByOwnerUserId(userId).catch(() => [])
    : [];

  // Fetch real scan logs and feedbacks for this business
  let businessScans = [];
  let businessFeedbacks = [];

  if (business?.id) {
    businessFeedbacks = await db
      .select()
      .from(customerFeedback)
      .where(eq(customerFeedback.businessId, business.id))
      .orderBy(desc(customerFeedback.createdAt))
      .limit(50)
      .catch(() => []);
  }

  if (myQrs.length > 0) {
    const qrIds = myQrs.map((q) => q.id);
    businessScans = await db
      .select({
        id: scanLogs.id,
        qrId: scanLogs.qrId,
        scannedAt: scanLogs.scannedAt,
      })
      .from(scanLogs)
      .where(inArray(scanLogs.qrId, qrIds))
      .orderBy(desc(scanLogs.scannedAt))
      .limit(500)
      .catch(() => []);
  }

  return (
    <OwnerDashboardView
      business={business}
      devices={myQrs}
      scanLogs={businessScans}
      feedbacks={businessFeedbacks}
    />
  );
}
