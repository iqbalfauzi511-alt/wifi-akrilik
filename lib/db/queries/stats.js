import { db, ensureDatabaseInitialized } from '@/lib/db';
import { qrCodes, businesses, scanLogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Get comprehensive analytics for Admin Dashboard
 */
export async function getAdminStats() {
  await ensureDatabaseInitialized();

  // 1. QR counts by status
  const qrStats = await db
    .select({
      status: qrCodes.status,
      count: sql`cast(count(${qrCodes.id}) as integer)`,
    })
    .from(qrCodes)
    .groupBy(qrCodes.status);

  let totalQr = 0;
  let blankQr = 0;
  let soldQr = 0;
  let activeQr = 0;
  let disabledQr = 0;

  qrStats.forEach((item) => {
    const c = item.count;
    totalQr += c;
    if (item.status === 'blank') blankQr = c;
    if (item.status === 'sold') soldQr = c;
    if (item.status === 'active') activeQr = c;
    if (item.status === 'disabled') disabledQr = c;
  });

  // 2. Businesses count
  const [bizCountResult] = await db
    .select({ count: sql`cast(count(${businesses.id}) as integer)` })
    .from(businesses);
  const totalBusinesses = bizCountResult?.count || 0;

  // 3. Scans count
  const [scansCountResult] = await db
    .select({ count: sql`cast(count(${scanLogs.id}) as integer)` })
    .from(scanLogs);
  const totalScans = scansCountResult?.count || 0;

  return {
    totalQr,
    availableQr: blankQr,
    soldQr,
    activeQr,
    disabledQr,
    totalBusinesses,
    totalScans,
  };
}

/**
 * Get statistics for a Customer Dashboard
 */
export async function getCustomerStats(businessId) {
  await ensureDatabaseInitialized();
  if (!businessId) {
    return { activeQrCount: 0, totalScans: 0, totalQrCount: 0 };
  }

  // Count active QRs
  const [activeQrResult] = await db
    .select({ count: sql`cast(count(${qrCodes.id}) as integer)` })
    .from(qrCodes)
    .where(eq(qrCodes.businessId, businessId));

  // Count total scans across all customer's QRs
  const [scansResult] = await db
    .select({ count: sql`cast(count(${scanLogs.id}) as integer)` })
    .from(scanLogs)
    .innerJoin(qrCodes, eq(scanLogs.qrId, qrCodes.id))
    .where(eq(qrCodes.businessId, businessId));

  return {
    activeQrCount: activeQrResult?.count || 0,
    totalScans: scansResult?.count || 0,
  };
}

/**
 * Get statistics for a Customer by User ID
 * Aggregates all devices across all businesses owned by this user
 */
export async function getCustomerStatsByUserId(userId) {
  await ensureDatabaseInitialized();
  if (!userId) {
    return { activeQrCount: 0, totalScans: 0, totalQrCount: 0 };
  }

  // Count active QRs and total QRs across all user's businesses
  const [qrResult] = await db
    .select({
      totalCount: sql`cast(count(${qrCodes.id}) as integer)`,
      activeCount: sql`cast(count(case when ${qrCodes.status} = 'active' then 1 end) as integer)`,
    })
    .from(qrCodes)
    .innerJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .where(eq(businesses.ownerId, userId));

  // Count total scans across all user's QRs
  const [scansResult] = await db
    .select({ count: sql`cast(count(${scanLogs.id}) as integer)` })
    .from(scanLogs)
    .innerJoin(qrCodes, eq(scanLogs.qrId, qrCodes.id))
    .innerJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .where(eq(businesses.ownerId, userId));

  return {
    activeQrCount: qrResult?.activeCount || 0,
    totalQrCount: qrResult?.totalCount || 0,
    totalScans: scansResult?.count || 0,
  };
}

