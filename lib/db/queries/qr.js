import { db, ensureDatabaseInitialized } from '@/lib/db';
import { qrCodes, businesses, scanLogs, users } from '@/lib/db/schema';
import { eq, sql, desc, and, like, or } from 'drizzle-orm';

/**
 * Get QR by code including business info
 */
export async function getQrByCode(code) {
  try {
    await ensureDatabaseInitialized();
    if (!code) return null;

    const result = await db
      .select({
        id: qrCodes.id,
        code: qrCodes.code,
        status: qrCodes.status,
        businessId: qrCodes.businessId,
        createdAt: qrCodes.createdAt,
        updatedAt: qrCodes.updatedAt,
        soldAt: qrCodes.soldAt,
        activatedAt: qrCodes.activatedAt,
        businessName: businesses.businessName,
        instagramUrl: businesses.instagramUrl,
        wifiName: businesses.wifiName,
        wifiPassword: businesses.wifiPassword,
        ownerId: businesses.ownerId,
      })
      .from(qrCodes)
      .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
      .where(eq(qrCodes.code, code.trim().toUpperCase()))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error in getQrByCode query:', error?.message || error);
    return null;
  }
}

/**
 * Get all QRs belonging to a business with total scans count
 */
export async function getQrsByBusinessId(businessId) {
  await ensureDatabaseInitialized();
  if (!businessId) return [];

  const results = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      status: qrCodes.status,
      businessId: qrCodes.businessId,
      createdAt: qrCodes.createdAt,
      activatedAt: qrCodes.activatedAt,
      scanCount: sql`cast(count(${scanLogs.id}) as integer)`,
    })
    .from(qrCodes)
    .leftJoin(scanLogs, eq(qrCodes.id, scanLogs.qrId))
    .where(eq(qrCodes.businessId, businessId))
    .groupBy(qrCodes.id)
    .orderBy(desc(qrCodes.createdAt));

  return results;
}

/**
 * Get all QRs for Admin with filters, search, and scan counts
 */
export async function getAllQrsAdmin({ status, search } = {}) {
  await ensureDatabaseInitialized();

  let query = db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      status: qrCodes.status,
      businessId: qrCodes.businessId,
      createdAt: qrCodes.createdAt,
      activatedAt: qrCodes.activatedAt,
      soldAt: qrCodes.soldAt,
      businessName: businesses.businessName,
      ownerEmail: users.email,
      scanCount: sql`cast(count(${scanLogs.id}) as integer)`,
    })
    .from(qrCodes)
    .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .leftJoin(users, eq(businesses.ownerId, users.id))
    .leftJoin(scanLogs, eq(qrCodes.id, scanLogs.qrId));

  const conditions = [];
  if (status && status !== 'all') {
    conditions.push(eq(qrCodes.status, status.toLowerCase()));
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toUpperCase()}%`;
    conditions.push(
      or(
        like(qrCodes.code, term),
        like(businesses.businessName, `%${search.trim()}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const results = await query
    .groupBy(qrCodes.id, businesses.businessName, users.email)
    .orderBy(desc(qrCodes.createdAt));

  return results;
}

/**
 * Bulk insert QR codes (status: blank)
 */
export async function bulkInsertQrs(codes) {
  await ensureDatabaseInitialized();
  if (!codes || codes.length === 0) return [];

  const values = codes.map((code) => ({
    code: code.trim().toUpperCase(),
    status: 'blank',
  }));

  const inserted = await db.insert(qrCodes).values(values).returning();
  return inserted;
}

/**
 * Update QR status (e.g. blank -> sold, active <-> disabled)
 */
export async function updateQrStatus(qrId, newStatus) {
  await ensureDatabaseInitialized();
  const updateData = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === 'sold') {
    updateData.soldAt = new Date();
  }

  const [updated] = await db
    .update(qrCodes)
    .set(updateData)
    .where(eq(qrCodes.id, qrId))
    .returning();

  return updated;
}

/**
 * Record a visitor scan log
 */
export async function recordScanLog(qrId, userAgent) {
  await ensureDatabaseInitialized();
  try {
    const [log] = await db
      .insert(scanLogs)
      .values({
        qrId,
        userAgent: userAgent ? userAgent.substring(0, 500) : null,
      })
      .returning();
    return log;
  } catch (error) {
    console.error('Failed to log scan:', error);
    return null;
  }
}
