import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/index';
import { qrCodes, qrBatches, businesses, users, scanLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Endpoint khusus pengujian E2E (TIDAK BISA DIAKSES DI PRODUCTION)
 * Digunakan oleh Playwright untuk memverifikasi isi database (verifikasi integritas)
 */
export async function POST(request) {
  // Strictly forbid in production under ANY circumstances
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Next.js dev command forces NODE_ENV=development, so we check a custom PLAYWRIGHT_TEST flag
  if (process.env.NODE_ENV !== 'test' && process.env.PLAYWRIGHT_TEST !== '1') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    await ensureDatabaseInitialized();
    const { action, payload } = await request.json();

    switch (action) {
      // 1. Verify QR row existence and status
      case 'verifyQr': {
        const { code } = payload;
        const qrs = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
        return NextResponse.json({ success: true, qr: qrs[0] || null });
      }

      // 2. Verify Business data
      case 'verifyBusiness': {
        const { businessId } = payload;
        const b = await db.select().from(businesses).where(eq(businesses.id, businessId));
        return NextResponse.json({ success: true, business: b[0] || null });
      }

      // 3. Setup Mock Data (if needed)
      case 'seedBusiness': {
        const { email, whatsapp, role = 'customer' } = payload;
        const cleanEmail = (email || '').toLowerCase().trim();
        const name = payload.name || (email ? email.split('@')[0] : 'Test User');
        let user = null;
        if (whatsapp) {
          const res = await db.select().from(users).where(eq(users.whatsappNumber, whatsapp));
          user = res[0];
        } else if (cleanEmail) {
          const res = await db.select().from(users).where(eq(users.email, cleanEmail));
          user = res[0];
        }
        if (!user) {
          const res = await db.insert(users).values({
            email: cleanEmail || null,
            whatsappNumber: whatsapp || null,
            role,
            name,
            emailVerified: true,
          }).returning();
          user = res[0];
        }
        let [biz] = await db.select().from(businesses).where(eq(businesses.ownerId, user.id));
        if (!biz) {
          const bizRes = await db.insert(businesses).values({
            ownerId: user.id,
            businessName: `${name} Business`,
            wifiEnabled: false,
            googleMapsUrl: 'https://maps.app.goo.gl/dummy'
          }).returning();
          biz = bizRes[0];
        }
        return NextResponse.json({ success: true, user, business: biz });
      }
      
      // 4. Verify Scan Logs
      case 'verifyScanLog': {
        const { qrId } = payload;
        const logs = await db.select().from(scanLogs).where(eq(scanLogs.qrId, qrId));
        return NextResponse.json({ success: true, logs });
      }

      // 5. Insert or Update Raw QR Code
      case 'insertQr': {
        const { code, status, businessId, wifiEnabled, wifiPassword } = payload;
        
        const existingQrs = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
        if (existingQrs.length > 0) {
          const qr = existingQrs[0];
          if (qr.businessId) {
            const updateBiz = {};
            if (wifiEnabled !== undefined) updateBiz.wifiEnabled = !!wifiEnabled;
            if (wifiPassword !== undefined) updateBiz.wifiPassword = wifiPassword;
            if (Object.keys(updateBiz).length > 0) {
              await db.update(businesses).set(updateBiz).where(eq(businesses.id, qr.businessId));
            }
          }
          if (status) {
            await db.update(qrCodes).set({ status }).where(eq(qrCodes.code, code));
          }
          const updated = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
          return NextResponse.json({ success: true, qr: updated[0] });
        }

        let targetBusinessId = businessId;
        if (!businessId && wifiEnabled !== undefined) {
           // Insert dummy business
           const ownerRes = await db.insert(users).values({ email: `dummy-${code}@test.com` }).returning();
           const bizRes = await db.insert(businesses).values({
             ownerId: ownerRes[0].id,
             businessName: 'Dummy Business',
             wifiEnabled: !!wifiEnabled,
             wifiPassword: wifiPassword || null,
             googleMapsUrl: 'https://maps.app.goo.gl/dummy'
           }).returning();
           targetBusinessId = bizRes[0].id;
        }

        const res = await db.insert(qrCodes).values({
          code,
          status: status || 'blank',
          businessId: targetBusinessId || null,
        }).returning();

        return NextResponse.json({ success: true, qr: res[0] });
      }

      // 6. Clear DB
      case 'clearDb': {
        // Safe to clear because we are in NODE_ENV=test and using in-memory/test PGlite
        await db.delete(scanLogs);
        await db.delete(qrCodes);
        await db.delete(qrBatches);
        await db.delete(businesses);
        await db.delete(users);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('E2E Test DB Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
