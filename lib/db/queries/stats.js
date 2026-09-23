import { db, ensureDatabaseInitialized } from '@/lib/db';
import { qrCodes, businesses, scanLogs } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Get comprehensive analytics for Admin Dashboard
 */
export async function getAdminStats() {
  await ensureDatabaseInitialized();

  let totalQr = 0;
  let blankQr = 0;
  let soldQr = 0;
  let activeQr = 0;
  let disabledQr = 0;
  let totalBusinesses = 0;
  let totalScans = 0;
  let recentScans7d = 0;
  let recentActivations30d = 0;
  let nodesThisMonth = 0;
  let wifiBizCount = 0;
  let reviewOnlyBizCount = 0;

  try {
    // QR counts by status
    const qrStats = await db
      .select({
        status: qrCodes.status,
        count: sql`cast(count(${qrCodes.id}) as integer)`,
      })
      .from(qrCodes)
      .groupBy(qrCodes.status);

    qrStats.forEach((item) => {
      const c = item.count || 0;
      totalQr += c;
      if (item.status === 'blank') blankQr = c;
      if (item.status === 'sold') soldQr = c;
      if (item.status === 'active') activeQr = c;
      if (item.status === 'disabled') disabledQr = c;
    });
  } catch (e) {
    console.warn('getAdminStats qrStats error:', e?.message || e);
  }

  try {
    // Businesses count
    const [bizCountResult] = await db
      .select({ count: sql`cast(count(${businesses.id}) as integer)` })
      .from(businesses);
    totalBusinesses = bizCountResult?.count || 0;
  } catch (e) {
    console.warn('getAdminStats bizCount error:', e?.message || e);
  }

  try {
    // Scans count
    const [scansCountResult] = await db
      .select({ count: sql`cast(count(${scanLogs.id}) as integer)` })
      .from(scanLogs);
    totalScans = scansCountResult?.count || 0;
  } catch (e) {
    console.warn('getAdminStats scansCount error:', e?.message || e);
  }

  // Scans past 7 days
  try {
    const [recentScansResult] = await db
      .select({ count: sql`cast(count(${scanLogs.id}) as integer)` })
      .from(scanLogs)
      .where(sql`${scanLogs.scannedAt} >= NOW() - INTERVAL '7 days'`);
    recentScans7d = recentScansResult?.count || 0;
  } catch (e) {
    recentScans7d = 0;
  }

  // 5. Activations past 30 days
  try {
    const [recentActResult] = await db
      .select({ count: sql`cast(count(${qrCodes.id}) as integer)` })
      .from(qrCodes)
      .where(sql`${qrCodes.activatedAt} >= NOW() - INTERVAL '30 days'`);
    recentActivations30d = recentActResult?.count || 0;
  } catch (e) {
    recentActivations30d = 0;
  }

  // 6. Nodes minted this month
  try {
    const [nodesMonthResult] = await db
      .select({ count: sql`cast(count(${qrCodes.id}) as integer)` })
      .from(qrCodes)
      .where(sql`${qrCodes.createdAt} >= date_trunc('month', NOW())`);
    nodesThisMonth = nodesMonthResult?.count || 0;
  } catch (e) {
    nodesThisMonth = 0;
  }

  // 7. Business feature breakdown (Wi-Fi enabled vs Direct Review)
  try {
    const [bizBreakdown] = await db
      .select({
        wifiCount: sql`cast(count(case when ${businesses.wifiEnabled} = true then 1 end) as integer)`,
        reviewOnlyCount: sql`cast(count(case when ${businesses.wifiEnabled} = false or ${businesses.wifiEnabled} is null then 1 end) as integer)`,
      })
      .from(businesses);
    wifiBizCount = bizBreakdown?.wifiCount || 0;
    reviewOnlyBizCount = bizBreakdown?.reviewOnlyCount || 0;
  } catch (e) {
    wifiBizCount = 0;
    reviewOnlyBizCount = totalBusinesses;
  }

  return {
    totalQr,
    availableQr: blankQr,
    soldQr,
    activeQr,
    disabledQr,
    totalBusinesses,
    totalScans,
    recentScans7d,
    recentActivations30d,
    nodesThisMonth,
    wifiBizCount,
    reviewOnlyBizCount,
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

