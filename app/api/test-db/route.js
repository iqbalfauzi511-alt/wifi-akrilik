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
        const { email, role = 'customer' } = payload;
        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
          const res = await db.insert(users).values({ email, role }).returning();
          user = res[0];
        }
        return NextResponse.json({ success: true, user });
      }
      
      // 4. Verify Scan Logs
      case 'verifyScanLog': {
        const { qrId } = payload;
        const logs = await db.select().from(scanLogs).where(eq(scanLogs.qrId, qrId));
        return NextResponse.json({ success: true, logs });
      }

      // 5. Insert Raw QR Code
      case 'insertQr': {
        const { code, status, businessId, wifiEnabled, wifiPassword } = payload;
        
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
