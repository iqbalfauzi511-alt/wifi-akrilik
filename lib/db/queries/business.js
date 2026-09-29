import { db, ensureDatabaseInitialized } from '../index.js';
import { businesses, qrCodes, scanLogs, users, customerFeedback } from '../schema.js';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Get business by owner user ID
 */
export async function getBusinessByOwnerId(ownerId) {
  await ensureDatabaseInitialized();
  if (!ownerId) return null;

  const result = await db.query.businesses.findFirst({
    where: eq(businesses.ownerId, ownerId),
  });

  return result || null;
}

/**
 * Get all businesses/outlets owned by a user
 */
export async function getBusinessesByOwnerId(ownerId) {
  await ensureDatabaseInitialized();
  if (!ownerId) return [];

  const results = await db.query.businesses.findMany({
    where: eq(businesses.ownerId, ownerId),
    orderBy: (businesses, { desc }) => [desc(businesses.createdAt)],
  });

  return results || [];
}

/**
 * Create a new business branch for an owner
 */
export async function createBusinessBranch(
  ownerId,
  { businessName, logoUrl, googleMapsReviewUrl, googleMapsUrl, wifiEnabled, wifiName, wifiPassword }
) {
  await ensureDatabaseInitialized();
  const reviewUrl = googleMapsReviewUrl !== undefined ? googleMapsReviewUrl : googleMapsUrl;

  const [created] = await db
    .insert(businesses)
    .values({
      ownerId,
      businessName: (businessName || 'Cabang Baru').trim(),
      logoUrl: logoUrl ? logoUrl.trim() : null,
      googleMapsReviewUrl: reviewUrl ? reviewUrl.trim() : null,
      googleMapsUrl: reviewUrl ? reviewUrl.trim() : null,
      wifiEnabled: Boolean(wifiEnabled),
      wifiName: wifiName ? wifiName.trim() : null,
      wifiPassword: wifiPassword ? wifiPassword.trim() : null,
    })
    .returning();

  return created;
}

/**
 * Create or update business for an owner
 */
export async function upsertBusinessForOwner(
  ownerId,
  { businessName, logoUrl, googleMapsReviewUrl, googleMapsUrl, wifiEnabled, wifiName, wifiPassword }
) {
  await ensureDatabaseInitialized();
  const existing = await getBusinessByOwnerId(ownerId);
  const reviewUrl = googleMapsReviewUrl !== undefined ? googleMapsReviewUrl : googleMapsUrl;

  if (existing) {
    const [updated] = await db
      .update(businesses)
      .set({
        businessName,
        logoUrl: logoUrl !== undefined ? (logoUrl ? logoUrl.trim() : null) : existing.logoUrl,
        googleMapsReviewUrl: reviewUrl !== undefined ? reviewUrl : (existing.googleMapsReviewUrl || existing.googleMapsUrl),
        googleMapsUrl: reviewUrl !== undefined ? reviewUrl : existing.googleMapsUrl,
        wifiEnabled: wifiEnabled !== undefined ? Boolean(wifiEnabled) : existing.wifiEnabled,
        wifiName: wifiName !== undefined ? wifiName : existing.wifiName,
        wifiPassword: wifiPassword !== undefined ? wifiPassword : existing.wifiPassword,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(businesses)
    .values({
      ownerId,
      businessName,
      logoUrl: logoUrl ? logoUrl.trim() : null,
      googleMapsReviewUrl: reviewUrl || null,
      googleMapsUrl: reviewUrl || null,
      wifiEnabled: Boolean(wifiEnabled),
      wifiName: wifiName || null,
      wifiPassword: wifiPassword || null,
    })
    .returning();

  return created;
}

/**
 * Transactional QR Activation:
 * 1. Verify authenticated user
 * 2. Get QR by code
 * 3. Verify QR status ('blank' or 'sold') and enforce ownership security
 * 4. Create/get business for authenticated customer
 * 5. Batch Activation: If QR has batch_id, assign business_id and set status 'active' to all QRs in same batch
 * 6. Set activated_at and commit transaction atomically
 */
export async function activateQrTransaction({ userId, qrCodeValue, businessData }) {
  await ensureDatabaseInitialized();

  if (!userId) {
    return { success: false, error: 'User belum terautentikasi' };
  }

  return await db.transaction(async (tx) => {
    // 1 & 2. Get QR and check status
    const normalizedCode = qrCodeValue?.trim().toUpperCase().replace(/[\u2013\u2014]/g, '-') || '';
    const qr = await tx.query.qrCodes.findFirst({
      where: eq(qrCodes.code, normalizedCode),
    });

    if (!qr) {
      return { success: false, error: 'QR Code tidak ditemukan' };
    }

    if (qr.status === 'active') {
      return {
        success: false,
        error: 'QR sudah diaktifkan. QR ini sudah terhubung dengan bisnis lain.',
      };
    }

    if (qr.status === 'disabled') {
      return {
        success: false,
        error: 'QR Code ini dinonaktifkan oleh administrator',
      };
    }

    // 3. Find or create business for this activation
    if (!businessData) {
      return { success: false, error: 'Data bisnis belum diisi' };
    }

    // Always enforce 1 Owner = 1 Business
    let userBusiness = await tx.query.businesses.findFirst({
      where: eq(businesses.ownerId, userId),
    });

    const reviewUrl =
      businessData.googleMapsReviewUrl !== undefined
        ? businessData.googleMapsReviewUrl
        : businessData.googleMapsUrl;

    if (!userBusiness) {
      const [newBiz] = await tx
        .insert(businesses)
        .values({
          ownerId: userId,
          businessName: businessData.businessName.trim(),
          logoUrl: businessData.logoUrl ? businessData.logoUrl.trim() : null,
          googleMapsReviewUrl: reviewUrl ? reviewUrl.trim() : null,
          googleMapsUrl: reviewUrl ? reviewUrl.trim() : null,
          wifiEnabled: Boolean(businessData.wifiEnabled),
          instagramUrl: businessData.instagramUrl ? businessData.instagramUrl.trim() : null,
          wifiName: businessData.wifiName ? businessData.wifiName.trim() : null,
          wifiPassword: businessData.wifiPassword ? businessData.wifiPassword.trim() : null,
          whatsappNumber: businessData.whatsappNumber ? businessData.whatsappNumber.trim() : null,
        })
        .returning();
      userBusiness = newBiz;
    } else {
      const updatePayload = {};
      if (businessData.businessName && businessData.businessName.trim()) {
        updatePayload.businessName = businessData.businessName.trim();
      }
      if (businessData.logoUrl !== undefined && businessData.logoUrl !== userBusiness.logoUrl) {
        updatePayload.logoUrl = businessData.logoUrl ? businessData.logoUrl.trim() : null;
      }
      if (reviewUrl && reviewUrl.trim()) {
        updatePayload.googleMapsReviewUrl = reviewUrl.trim();
        updatePayload.googleMapsUrl = reviewUrl.trim();
      }
      if (businessData.wifiEnabled !== undefined && Boolean(businessData.wifiEnabled) !== userBusiness.wifiEnabled) {
        updatePayload.wifiEnabled = Boolean(businessData.wifiEnabled);
      }
      if (businessData.instagramUrl !== undefined) {
        updatePayload.instagramUrl = businessData.instagramUrl ? businessData.instagramUrl.trim() : null;
      }
      if (businessData.wifiName && businessData.wifiName.trim()) {
        updatePayload.wifiName = businessData.wifiName.trim();
      }
      if (businessData.wifiPassword && businessData.wifiPassword.trim()) {
        updatePayload.wifiPassword = businessData.wifiPassword.trim();
      }
      if (businessData.whatsappNumber && businessData.whatsappNumber.trim()) {
        updatePayload.whatsappNumber = businessData.whatsappNumber.trim();
      }

      if (Object.keys(updatePayload).length > 0) {
        updatePayload.updatedAt = new Date();
        const [updatedBiz] = await tx
          .update(businesses)
          .set(updatePayload)
          .where(eq(businesses.id, userBusiness.id))
          .returning();
        userBusiness = updatedBiz;
      }
    }

    // 4 & 5. Batch Activation:
    // If QR belongs to a batch, activate ALL QR codes sharing this batch_id
    const now = new Date();
    let activatedQrs = [];

    if (qr.batchId) {
      activatedQrs = await tx
        .update(qrCodes)
        .set({
          businessId: userBusiness.id,
          status: 'active',
          activatedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(qrCodes.batchId, qr.batchId),
            inArray(qrCodes.status, ['blank', 'sold'])
          )
        )
        .returning();
    } else {
      // Standalone single QR activation with atomic status condition
      activatedQrs = await tx
        .update(qrCodes)
        .set({
          businessId: userBusiness.id,
          status: 'active',
          activatedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(qrCodes.id, qr.id),
            inArray(qrCodes.status, ['blank', 'sold'])
          )
        )
        .returning();
    }

    if (!activatedQrs || activatedQrs.length === 0) {
      return {
        success: false,
        error: 'QR Code telah diaktifkan oleh proses lain atau statusnya sudah berubah.',
      };
    }

    return {
      success: true,
      qr: activatedQrs.find((q) => q.code === qr.code) || activatedQrs[0],
      batchCount: activatedQrs.length,
      activatedQrs,
      business: userBusiness,
    };
  });
}

/**
 * Update business Wi-Fi credentials and details
 */
export async function updateBusinessDetails(businessId, ownerId, updateFields) {
  await ensureDatabaseInitialized();

  const cleanFields = { ...updateFields };
  if (cleanFields.googleMapsReviewUrl !== undefined && cleanFields.googleMapsUrl === undefined) {
    cleanFields.googleMapsUrl = cleanFields.googleMapsReviewUrl;
  } else if (cleanFields.googleMapsUrl !== undefined && cleanFields.googleMapsReviewUrl === undefined) {
    cleanFields.googleMapsReviewUrl = cleanFields.googleMapsUrl;
  }

  // Enforce server-side ownership authorization
  const [updated] = await db
    .update(businesses)
    .set({
      ...cleanFields,
      updatedAt: new Date(),
    })
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, ownerId)))
    .returning();

  return updated || null;
}

/**
 * Admin Permanently Delete a Business
 * Unlinks any associated QR codes (reverting them to 'blank' status) and deletes the business record.
 */
export async function deleteBusinessAdmin(businessId) {
  await ensureDatabaseInitialized();
  if (!businessId) return null;

  // 1. Delete all scan logs for QR codes belonging to this business
  const qrs = await db.select({ id: qrCodes.id }).from(qrCodes).where(eq(qrCodes.businessId, businessId));
  if (qrs.length > 0) {
    const qrIds = qrs.map(q => q.id);
    await db.delete(scanLogs).where(inArray(scanLogs.qrId, qrIds));
  }
  
  // 2. Unlink associated QR codes
  await db
    .update(qrCodes)
    .set({
      businessId: null,
      status: 'blank',
      activatedAt: null,
      soldAt: null,
      deviceName: null,
      googleMapsReviewUrl: null,
      googleMapsUrl: null,
      wifiEnabled: null,
      wifiName: null,
      wifiPassword: null,
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.businessId, businessId));

  const [deleted] = await db
    .delete(businesses)
    .where(eq(businesses.id, businessId))
    .returning();

  return deleted || null;
}

/**
 * Admin Permanently Delete a User Account
 * Deletes any owned businesses (unlinking their QRs) and the user record.
 * Protects administrator accounts from deletion.
 */
export async function deleteUserAdmin(userId, currentAdminId, currentAdminEmail) {
  await ensureDatabaseInitialized();
  if (!userId) return { success: false, error: 'User ID tidak valid' };

  const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!targetUser) {
    return { success: false, error: 'Pengguna tidak ditemukan' };
  }

  // Prevent deleting currently logged in admin or the main system admin
  if (
    targetUser.id === currentAdminId ||
    (targetUser.email && targetUser.email === 'distrapness@gmail.com') ||
    (currentAdminEmail && targetUser.email === currentAdminEmail)
  ) {
    return { success: false, error: 'Akun Administrator utama atau akun Anda sendiri tidak dapat dihapus' };
  }

  // Find all businesses owned by this user
  const userBiz = await db.select().from(businesses).where(eq(businesses.ownerId, userId));
  for (const b of userBiz) {
    // 1. Delete all scan logs for QR codes belonging to this business
    const qrs = await db.select({ id: qrCodes.id }).from(qrCodes).where(eq(qrCodes.businessId, b.id));
    if (qrs.length > 0) {
      const qrIds = qrs.map(q => q.id);
      await db.delete(scanLogs).where(inArray(scanLogs.qrId, qrIds));
    }
    
    // 2. Customer feedback is cascaded from business deletion, but just in case:
    await db.delete(customerFeedback).where(eq(customerFeedback.businessId, b.id));

    // 3. Reset all physical QR codes to factory blank state
    await db
      .update(qrCodes)
      .set({
        businessId: null,
        status: 'blank',
        activatedAt: null,
        soldAt: null,
        deviceName: null,
        googleMapsReviewUrl: null,
        googleMapsUrl: null,
        wifiEnabled: null,
        wifiName: null,
        wifiPassword: null,
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.businessId, b.id));

    await db.delete(businesses).where(eq(businesses.id, b.id));
  }

  const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning();
  return { success: true, user: deletedUser };
}
