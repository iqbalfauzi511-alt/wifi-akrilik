import { db, ensureDatabaseInitialized } from '../index.js';
import { qrCodes, qrBatches, businesses, scanLogs, users } from '../schema.js';
import { eq, sql, desc, and, like, or, inArray } from 'drizzle-orm';
import { generateBatchCode, generateBatchQrCodes } from '../../utils/code-generator.js';

/**
 * Get QR by code including business info and batch info
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
        batchId: qrCodes.batchId,
        batchCode: qrBatches.batchCode,
        createdAt: qrCodes.createdAt,
        updatedAt: qrCodes.updatedAt,
        soldAt: qrCodes.soldAt,
        activatedAt: qrCodes.activatedAt,
        businessName: businesses.businessName,
        googleMapsReviewUrl: businesses.googleMapsReviewUrl,
        googleMapsUrl: businesses.googleMapsUrl,
        instagramUrl: businesses.instagramUrl,
        wifiName: businesses.wifiName,
        wifiPassword: businesses.wifiPassword,
        ownerId: businesses.ownerId,
      })
      .from(qrCodes)
      .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
      .leftJoin(qrBatches, eq(qrCodes.batchId, qrBatches.id))
      .where(eq(qrCodes.code, code.trim().toUpperCase()))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error in getQrByCode query:', error?.message || error);
    return null;
  }
}

/**
 * Get Public QR by code (SAFE FOR INITIAL CLIENT RENDER)
 * Strictly omits wifiPassword to protect against leakage in initial HTML/RSC payload.
 */
export async function getPublicQrByCode(code) {
  try {
    await ensureDatabaseInitialized();
    if (!code) return null;

    const result = await db
      .select({
        id: qrCodes.id,
        code: qrCodes.code,
        status: qrCodes.status,
        businessId: qrCodes.businessId,
        batchId: qrCodes.batchId,
        batchCode: qrBatches.batchCode,
        createdAt: qrCodes.createdAt,
        updatedAt: qrCodes.updatedAt,
        soldAt: qrCodes.soldAt,
        activatedAt: qrCodes.activatedAt,
        businessName: businesses.businessName,
        googleMapsReviewUrl: businesses.googleMapsReviewUrl,
        googleMapsUrl: businesses.googleMapsUrl,
        wifiEnabled: businesses.wifiEnabled,
        wifiName: businesses.wifiName,
        instagramUrl: businesses.instagramUrl,
        ownerId: businesses.ownerId,
      })
      .from(qrCodes)
      .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
      .leftJoin(qrBatches, eq(qrCodes.batchId, qrBatches.id))
      .where(eq(qrCodes.code, code.trim().toUpperCase()))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error in getPublicQrByCode query:', error?.message || error);
    return null;
  }
}

/**
 * Get Wi-Fi credentials for a specific QR code (Used exclusively by POST /api/q/[code]/reveal-wifi)
 * Verifies QR exists, status is 'active', and wifiEnabled is true before returning Wi-Fi credentials.
 */
export async function getQrWifiCredentials(code) {
  try {
    await ensureDatabaseInitialized();
    if (!code) return { error: 'notFound' };

    const result = await db
      .select({
        id: qrCodes.id,
        code: qrCodes.code,
        status: qrCodes.status,
        businessId: qrCodes.businessId,
        wifiEnabled: businesses.wifiEnabled,
        wifiName: businesses.wifiName,
        wifiPassword: businesses.wifiPassword,
      })
      .from(qrCodes)
      .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
      .where(eq(qrCodes.code, code.trim().toUpperCase()))
      .limit(1);

    if (!result || result.length === 0) {
      return { error: 'notFound' };
    }

    const qr = result[0];
    if (qr.status !== 'active') {
      return { error: 'inactive', status: qr.status };
    }

    if (!qr.businessId) {
      return { error: 'noBusiness' };
    }

    if (!qr.wifiEnabled) {
      return { error: 'wifiDisabled' };
    }

    if (!qr.wifiPassword) {
      return { error: 'noPassword' };
    }

    return {
      success: true,
      wifi_name: qr.wifiName || 'Wi-Fi Tamu',
      wifi_password: qr.wifiPassword,
    };
  } catch (error) {
    console.error('Error fetching Wi-Fi credentials for QR:', error);
    return { error: 'serverError' };
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
    .groupBy(
      qrCodes.id,
      qrCodes.code,
      qrCodes.status,
      qrCodes.businessId,
      qrCodes.createdAt,
      qrCodes.activatedAt
    )
    .orderBy(desc(qrCodes.createdAt));

  return results;
}

/**
 * Get all QRs for Admin with filters, search, and scan counts
 */
export async function getAllQrsAdmin({ status, search, batch } = {}) {
  await ensureDatabaseInitialized();

  let query = db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      status: qrCodes.status,
      businessId: qrCodes.businessId,
      batchId: qrCodes.batchId,
      batchCode: qrBatches.batchCode,
      createdAt: qrCodes.createdAt,
      activatedAt: qrCodes.activatedAt,
      soldAt: qrCodes.soldAt,
      businessName: businesses.businessName,
      googleMapsReviewUrl: businesses.googleMapsReviewUrl,
      googleMapsUrl: businesses.googleMapsUrl,
      wifiEnabled: businesses.wifiEnabled,
      ownerEmail: users.email,
      scanCount: sql`cast(count(${scanLogs.id}) as integer)`,
    })
    .from(qrCodes)
    .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .leftJoin(qrBatches, eq(qrCodes.batchId, qrBatches.id))
    .leftJoin(users, eq(businesses.ownerId, users.id))
    .leftJoin(scanLogs, eq(qrCodes.id, scanLogs.qrId));

  const conditions = [];
  if (status && status !== 'all') {
    conditions.push(eq(qrCodes.status, status.toLowerCase()));
  }

  if (batch && batch !== 'all') {
    conditions.push(eq(qrBatches.batchCode, batch));
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toUpperCase()}%`;
    conditions.push(
      or(
        like(qrCodes.code, term),
        like(qrBatches.batchCode, term),
        like(businesses.businessName, `%${search.trim()}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const results = await query
    .groupBy(
      qrCodes.id,
      qrCodes.code,
      qrCodes.status,
      qrCodes.businessId,
      qrCodes.batchId,
      qrBatches.batchCode,
      qrCodes.createdAt,
      qrCodes.activatedAt,
      qrCodes.soldAt,
      businesses.businessName,
      businesses.googleMapsReviewUrl,
      businesses.googleMapsUrl,
      businesses.wifiEnabled,
      users.email
    )
    .orderBy(desc(qrCodes.createdAt));

  return results;
}

/**
 * Create a new Batch with a set of unique QR codes (status: blank)
 * @param {number} quantity Number of QR codes in the package
 */
export async function createBatchWithQrs(quantity = 5) {
  await ensureDatabaseInitialized();
  const validQty = Math.min(Math.max(1, isNaN(quantity) ? 5 : quantity), 500);

  // Determine sequential batch code (e.g. BATCH-001)
  const countResult = await db.select({ count: sql`count(*)` }).from(qrBatches);
  const currentBatchCount = Number(countResult[0]?.count || 0);
  let batchCode = generateBatchCode(currentBatchCount + 1);

  // Ensure unique batch code
  let existing = await db.query.qrBatches.findFirst({
    where: eq(qrBatches.batchCode, batchCode),
  });
  let attempts = 0;
  while (existing && attempts < 20) {
    attempts++;
    batchCode = generateBatchCode(currentBatchCount + 1 + attempts);
    existing = await db.query.qrBatches.findFirst({
      where: eq(qrBatches.batchCode, batchCode),
    });
  }

  // Insert new batch record
  const [newBatch] = await db.insert(qrBatches).values({
    batchCode,
  }).returning();

  // Generate unique QR codes
  const codes = generateBatchQrCodes(validQty);
  const values = codes.map((code) => ({
    code: code.trim().toUpperCase(),
    status: 'blank',
    batchId: newBatch.id,
  }));

  const insertedQrs = await db.insert(qrCodes).values(values).returning();

  return {
    batch: newBatch,
    qrs: insertedQrs.map((q) => ({
      ...q,
      batchCode: newBatch.batchCode,
      batchId: newBatch.id,
      businessName: null,
      ownerEmail: null,
      scanCount: 0,
    })),
  };
}

/**
 * Bulk insert QR codes (status: blank, with optional batchId)
 */
export async function bulkInsertQrs(codes, batchId = null) {
  await ensureDatabaseInitialized();
  if (!codes || codes.length === 0) return [];

  const values = codes.map((code) => ({
    code: code.trim().toUpperCase(),
    status: 'blank',
    batchId: batchId || null,
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
 * Admin Reset Single QR:
 * Reverts to status: 'blank', unlinks business, clears activated_at & sold_at.
 * Keeps existing physical QR record & unique code intact.
 */
export async function resetQrAdmin(qrId) {
  await ensureDatabaseInitialized();
  const [reset] = await db
    .update(qrCodes)
    .set({
      status: 'blank',
      businessId: null,
      activatedAt: null,
      soldAt: null,
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.id, qrId))
    .returning();

  return reset;
}

/**
 * Admin Reset Entire Batch:
 * Reverts all QRs belonging to batchId to 'blank', unlinking business.
 * Preserves the batch record and all QR records for reuse.
 */
export async function resetBatchAdmin(batchId) {
  await ensureDatabaseInitialized();
  if (!batchId) return [];

  const resetList = await db
    .update(qrCodes)
    .set({
      status: 'blank',
      businessId: null,
      activatedAt: null,
      soldAt: null,
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.batchId, batchId))
    .returning();

  return resetList;
}

/**
 * Get all Batches with total and active QR counts
 */
export async function getAllBatchesAdmin() {
  await ensureDatabaseInitialized();
  const batches = await db
    .select({
      id: qrBatches.id,
      batchCode: qrBatches.batchCode,
      createdAt: qrBatches.createdAt,
      totalQrs: sql`cast(count(${qrCodes.id}) as integer)`,
      activeQrs: sql`cast(count(case when ${qrCodes.status} = 'active' then 1 end) as integer)`,
    })
    .from(qrBatches)
    .leftJoin(qrCodes, eq(qrBatches.id, qrCodes.batchId))
    .groupBy(qrBatches.id, qrBatches.batchCode, qrBatches.createdAt)
    .orderBy(desc(qrBatches.createdAt));

  return batches;
}

/**
 * Record a visitor scan log
 */
export async function recordScanLog(qrId, userAgent) {
  try {
    await ensureDatabaseInitialized();
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

/**
 * Admin Permanently Delete a Single QR Code
 */
export async function deleteQrAdmin(qrId) {
  await ensureDatabaseInitialized();
  if (!qrId) return null;

  // Clean scan logs first
  await db.delete(scanLogs).where(eq(scanLogs.qrId, qrId));

  const [deleted] = await db
    .delete(qrCodes)
    .where(eq(qrCodes.id, qrId))
    .returning();

  return deleted || null;
}

/**
 * Admin Permanently Delete an Entire Batch of QR Codes
 */
export async function deleteBatchAdmin(batchId) {
  await ensureDatabaseInitialized();
  if (!batchId) return { deletedBatch: null, count: 0 };

  // Find all QRs in this batch
  const qrs = await db.select({ id: qrCodes.id }).from(qrCodes).where(eq(qrCodes.batchId, batchId));
  const qrIds = qrs.map((q) => q.id);

  if (qrIds.length > 0) {
    await db.delete(scanLogs).where(inArray(scanLogs.qrId, qrIds));
    await db.delete(qrCodes).where(eq(qrCodes.batchId, batchId));
  }

  const [deletedBatch] = await db
    .delete(qrBatches)
    .where(eq(qrBatches.id, batchId))
    .returning();

  return { deletedBatch, count: qrIds.length };
}

/**
 * Get all QRs belonging to all businesses owned by a specific user ID
 * Guarantees all purchased & activated devices (single or batch) appear in customer dashboard
 */
export async function getQrsByOwnerUserId(userId) {
  await ensureDatabaseInitialized();
  if (!userId) return [];

  const results = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      status: qrCodes.status,
      businessId: qrCodes.businessId,
      batchId: qrCodes.batchId,
      batchCode: qrBatches.batchCode,
      createdAt: qrCodes.createdAt,
      activatedAt: qrCodes.activatedAt,
      businessName: businesses.businessName,
      googleMapsReviewUrl: businesses.googleMapsReviewUrl,
      googleMapsUrl: businesses.googleMapsUrl,
      wifiEnabled: businesses.wifiEnabled,
      scanCount: sql`cast(count(${scanLogs.id}) as integer)`,
    })
    .from(qrCodes)
    .innerJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .leftJoin(qrBatches, eq(qrCodes.batchId, qrBatches.id))
    .leftJoin(scanLogs, eq(qrCodes.id, scanLogs.qrId))
    .where(eq(businesses.ownerId, userId))
    .groupBy(
      qrCodes.id,
      qrCodes.code,
      qrCodes.status,
      qrCodes.businessId,
      qrCodes.batchId,
      qrBatches.batchCode,
      qrCodes.createdAt,
      qrCodes.activatedAt,
      businesses.businessName,
      businesses.googleMapsReviewUrl,
      businesses.googleMapsUrl,
      businesses.wifiEnabled
    )
    .orderBy(desc(qrCodes.createdAt));

  return results;
}

/**
 * Bulk update QR status for multiple QR IDs (Admin)
 */
export async function bulkUpdateQrStatus(qrIds, newStatus) {
  await ensureDatabaseInitialized();
  if (!qrIds || qrIds.length === 0) return [];

  const updateData = {
    status: newStatus,
    updatedAt: new Date(),
  };
  if (newStatus === 'sold') {
    updateData.soldAt = new Date();
  }

  const updated = await db
    .update(qrCodes)
    .set(updateData)
    .where(inArray(qrCodes.id, qrIds))
    .returning();

  return updated;
}

/**
 * Bulk permanently delete QRs (Admin)
 */
export async function bulkDeleteQrs(qrIds) {
  await ensureDatabaseInitialized();
  if (!qrIds || qrIds.length === 0) return 0;

  // Clean scan logs first
  await db.delete(scanLogs).where(inArray(scanLogs.qrId, qrIds));

  const deleted = await db
    .delete(qrCodes)
    .where(inArray(qrCodes.id, qrIds))
    .returning();

  return deleted.length;
}

/**
 * Bulk reset QRs to 'blank' (Admin)
 */
export async function bulkResetQrs(qrIds) {
  await ensureDatabaseInitialized();
  if (!qrIds || qrIds.length === 0) return [];

  const resetList = await db
    .update(qrCodes)
    .set({
      status: 'blank',
      businessId: null,
      activatedAt: null,
      soldAt: null,
      updatedAt: new Date(),
    })
    .where(inArray(qrCodes.id, qrIds))
    .returning();

  return resetList;
}

/**
 * Customer bulk update status: only allows 'active' or 'disabled'
 * Strictly verifies ownership by joining with businesses owned by userId
 */
export async function customerBulkUpdateStatus(userId, qrIds, newStatus) {
  await ensureDatabaseInitialized();
  if (!userId || !qrIds || qrIds.length === 0) return [];
  if (!['active', 'disabled'].includes(newStatus)) return [];

  // Find QRs owned by this user
  const ownedQrs = await db
    .select({ id: qrCodes.id })
    .from(qrCodes)
    .innerJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .where(and(eq(businesses.ownerId, userId), inArray(qrCodes.id, qrIds)));

  const ownedIds = ownedQrs.map((q) => q.id);
  if (ownedIds.length === 0) return [];

  const updated = await db
    .update(qrCodes)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(inArray(qrCodes.id, ownedIds))
    .returning();

  return updated;
}

/**
 * Customer bulk unlink / remove devices from their account
 * Reverts QR back to 'blank' unlinked status
 */
export async function customerBulkUnlink(userId, qrIds) {
  await ensureDatabaseInitialized();
  if (!userId || !qrIds || qrIds.length === 0) return [];

  // Find QRs owned by this user
  const ownedQrs = await db
    .select({ id: qrCodes.id })
    .from(qrCodes)
    .innerJoin(businesses, eq(qrCodes.businessId, businesses.id))
    .where(and(eq(businesses.ownerId, userId), inArray(qrCodes.id, qrIds)));

  const ownedIds = ownedQrs.map((q) => q.id);
  if (ownedIds.length === 0) return [];

  const unlinked = await db
    .update(qrCodes)
    .set({
      businessId: null,
      status: 'blank',
      activatedAt: null,
      updatedAt: new Date(),
    })
    .where(inArray(qrCodes.id, ownedIds))
    .returning();

  return unlinked;
}

