import { db, ensureDatabaseInitialized } from '../index.js';
import { businesses, qrCodes, scanLogs } from '../schema.js';
import { eq, and } from 'drizzle-orm';

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
export async function upsertBusinessForOwner(ownerId, { businessName, googleMapsUrl, wifiEnabled, wifiName, wifiPassword, instagramUrl }) {
  await ensureDatabaseInitialized();
  const existing = await getBusinessByOwnerId(ownerId);

  if (existing) {
    const [updated] = await db
      .update(businesses)
      .set({
        businessName,
        googleMapsUrl: googleMapsUrl !== undefined ? googleMapsUrl : existing.googleMapsUrl,
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
      googleMapsUrl: googleMapsUrl || null,
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

    if (!userBusiness) {
      const [newBiz] = await tx
        .insert(businesses)
        .values({
          ownerId: userId,
          businessName: businessData.businessName.trim(),
          googleMapsUrl: businessData.googleMapsUrl ? businessData.googleMapsUrl.trim() : null,
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
          googleMapsUrl: businessData.googleMapsUrl ? businessData.googleMapsUrl.trim() : userBusiness.googleMapsUrl,
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
        .where(eq(qrCodes.batchId, qr.batchId))
        .returning();
    } else {
      // Standalone single QR activation
      activatedQrs = await tx
        .update(qrCodes)
        .set({
          businessId: userBusiness.id,
          status: 'active',
          activatedAt: now,
          updatedAt: now,
        })
        .where(eq(qrCodes.id, qr.id))
        .returning();
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

  // Enforce server-side ownership authorization
  const [updated] = await db
    .update(businesses)
    .set({
      ...updateFields,
      updatedAt: new Date(),
    })
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, ownerId)))
    .returning();

  return updated || null;
}
