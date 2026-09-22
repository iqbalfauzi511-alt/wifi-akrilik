import { db, ensureDatabaseInitialized } from '../index.js';
import { businesses, qrCodes, scanLogs, users } from '../schema.js';
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
 * Create or update business for an owner
 */
export async function upsertBusinessForOwner(
  ownerId,
  { businessName, logoUrl, googleMapsReviewUrl, googleMapsUrl, wifiEnabled, wifiName, wifiPassword, instagramUrl }
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
        instagramUrl: instagramUrl !== undefined ? instagramUrl : existing.instagramUrl,
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
      instagramUrl: instagramUrl || null,
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
    const qr = await tx.query.qrCodes.findFirst({
      where: eq(qrCodes.code, qrCodeValue.trim().toUpperCase()),
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

    let userBusiness = null;
    if (businessData?.businessName) {
      userBusiness = await tx.query.businesses.findFirst({
        where: and(
          eq(businesses.ownerId, userId),
          eq(businesses.businessName, businessData.businessName.trim())
        ),
      });
    }

    // Fallback: If no business matching that exact name, find the user's primary/first business
    // Ensures all new devices or batches purchased by this customer are collected under their account!
    if (!userBusiness) {
      userBusiness = await tx.query.businesses.findFirst({
        where: eq(businesses.ownerId, userId),
      });
    }

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
        })
        .returning();
      userBusiness = newBiz;
    } else {
      const [updatedBiz] = await tx
        .update(businesses)
        .set({
          businessName: businessData.businessName.trim(),
          logoUrl:
            businessData.logoUrl !== undefined
              ? (businessData.logoUrl ? businessData.logoUrl.trim() : null)
              : userBusiness.logoUrl,
          googleMapsReviewUrl:
            reviewUrl !== undefined
              ? (reviewUrl ? reviewUrl.trim() : null)
              : (userBusiness.googleMapsReviewUrl || userBusiness.googleMapsUrl),
          googleMapsUrl:
            reviewUrl !== undefined
              ? (reviewUrl ? reviewUrl.trim() : null)
              : userBusiness.googleMapsUrl,
          wifiEnabled: businessData.wifiEnabled !== undefined ? Boolean(businessData.wifiEnabled) : userBusiness.wifiEnabled,
          instagramUrl: businessData.instagramUrl ? businessData.instagramUrl.trim() : userBusiness.instagramUrl,
          wifiName: businessData.wifiName !== undefined ? (businessData.wifiName ? businessData.wifiName.trim() : null) : userBusiness.wifiName,
          wifiPassword: businessData.wifiPassword !== undefined ? (businessData.wifiPassword ? businessData.wifiPassword.trim() : null) : userBusiness.wifiPassword,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, userBusiness.id))
        .returning();
      userBusiness = updatedBiz;
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

  // Unlink associated QR codes
  await db
    .update(qrCodes)
    .set({
      businessId: null,
      status: 'blank',
      activatedAt: null,
      soldAt: null,
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
export async function deleteUserAdmin(userId, currentAdminEmail) {
  await ensureDatabaseInitialized();
  if (!userId) return { success: false, error: 'User ID tidak valid' };

  const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!targetUser) {
    return { success: false, error: 'Pengguna tidak ditemukan' };
  }

  // Prevent deleting administrator account
  if (
    targetUser.role === 'admin' ||
    targetUser.email === currentAdminEmail ||
    targetUser.email === 'distrapness@gmail.com'
  ) {
    return { success: false, error: 'Akun Administrator tidak dapat dihapus' };
  }

  // Find all businesses owned by this user
  const userBiz = await db.select().from(businesses).where(eq(businesses.ownerId, userId));
  for (const b of userBiz) {
    await db
      .update(qrCodes)
      .set({
        businessId: null,
        status: 'blank',
        activatedAt: null,
        soldAt: null,
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.businessId, b.id));

    await db.delete(businesses).where(eq(businesses.id, b.id));
  }

  const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning();
  return { success: true, user: deletedUser };
}
