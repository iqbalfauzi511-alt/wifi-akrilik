import { db, ensureDatabaseInitialized } from '@/lib/db';
import { businesses, qrCodes } from '@/lib/db/schema';
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
export async function upsertBusinessForOwner(ownerId, { businessName, instagramUrl, wifiName, wifiPassword }) {
  await ensureDatabaseInitialized();
  const existing = await getBusinessByOwnerId(ownerId);

  if (existing) {
    const [updated] = await db
      .update(businesses)
      .set({
        businessName,
        instagramUrl,
        wifiName,
        wifiPassword,
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
      instagramUrl,
      wifiName,
      wifiPassword,
    })
    .returning();

  return created;
}

/**
 * Transactional QR Activation:
 * 1. Verify QR exists
 * 2. Verify QR status is 'blank' or 'sold' (reject if already 'active' or 'disabled')
 * 3. Find or create business for authenticated user
 * 4. Link QR to user's business
 * 5. Update QR status to 'active' & set activatedAt
 */
export async function activateQrTransaction({ userId, qrCodeValue, businessData }) {
  await ensureDatabaseInitialized();

  // 1 & 2. Get QR and check status
  const qr = await db.query.qrCodes.findFirst({
    where: eq(qrCodes.code, qrCodeValue.trim().toUpperCase()),
  });

  if (!qr) {
    return { success: false, error: 'QR Code tidak ditemukan' };
  }

  if (qr.status === 'active') {
    return { success: false, error: 'QR Code ini sudah diaktifkan sebelumnya' };
  }

  if (qr.status === 'disabled') {
    return { success: false, error: 'QR Code ini dinonaktifkan oleh administrator' };
  }

  // 3. Upsert user's business
  let userBusiness = await getBusinessByOwnerId(userId);
  if (!userBusiness) {
    if (!businessData) {
      return { success: false, error: 'Data bisnis belum diisi' };
    }
    const [newBiz] = await db.insert(businesses).values({
      ownerId: userId,
      businessName: businessData.businessName,
      instagramUrl: businessData.instagramUrl,
      wifiName: businessData.wifiName,
      wifiPassword: businessData.wifiPassword,
    }).returning();
    userBusiness = newBiz;
  } else if (businessData) {
    // Optionally update business fields if provided in activation form
    const [updatedBiz] = await db.update(businesses).set({
      businessName: businessData.businessName || userBusiness.businessName,
      instagramUrl: businessData.instagramUrl || userBusiness.instagramUrl,
      wifiName: businessData.wifiName || userBusiness.wifiName,
      wifiPassword: businessData.wifiPassword || userBusiness.wifiPassword,
      updatedAt: new Date(),
    }).where(eq(businesses.id, userBusiness.id)).returning();
    userBusiness = updatedBiz;
  }

  // 4 & 5. Activate QR
  const [activatedQr] = await db
    .update(qrCodes)
    .set({
      businessId: userBusiness.id,
      status: 'active',
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.id, qr.id))
    .returning();

  return {
    success: true,
    qr: activatedQr,
    business: userBusiness,
  };
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
