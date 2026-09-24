import { NextResponse } from 'next/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { qrCodes, qrBatches, businesses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Admin-only: block in production from non-admins
  const { getCurrentSession } = await import('@/lib/auth/session');
  const session = await getCurrentSession();
  if (session?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const testCode = searchParams.get('code') || 'CS-HHTHUZ';

  try {
    await ensureDatabaseInitialized();

    // Test 1: Simple select from qrCodes (no JOIN)
    let simpleResult = null;
    let simpleError = null;
    try {
      const rows = await db.select({ id: qrCodes.id, code: qrCodes.code, status: qrCodes.status, batchId: qrCodes.batchId })
        .from(qrCodes)
        .where(eq(qrCodes.code, testCode))
        .limit(1);
      simpleResult = rows[0] || null;
    } catch (e) {
      simpleError = e.message;
    }

    // Test 2: With LEFT JOIN to qr_batches only
    let batchJoinResult = null;
    let batchJoinError = null;
    try {
      const rows = await db.select({ id: qrCodes.id, code: qrCodes.code, batchCode: qrBatches.batchCode })
        .from(qrCodes)
        .leftJoin(qrBatches, eq(qrCodes.batchId, qrBatches.id))
        .where(eq(qrCodes.code, testCode))
        .limit(1);
      batchJoinResult = rows[0] || null;
    } catch (e) {
      batchJoinError = e.message;
    }

    // Test 3: With LEFT JOIN to businesses only (no instagram_url)
    let bizJoinBasicResult = null;
    let bizJoinBasicError = null;
    try {
      const rows = await db.select({ id: qrCodes.id, code: qrCodes.code, businessName: businesses.businessName })
        .from(qrCodes)
        .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
        .where(eq(qrCodes.code, testCode))
        .limit(1);
      bizJoinBasicResult = rows[0] || null;
    } catch (e) {
      bizJoinBasicError = e.message;
    }

    // Test 4: Full query like getPublicQrByCode (including instagramUrl)
    let fullQueryResult = null;
    let fullQueryError = null;
    try {
      const rows = await db.select({
        id: qrCodes.id,
        code: qrCodes.code,
        status: qrCodes.status,
        businessId: qrCodes.businessId,
        batchCode: qrBatches.batchCode,
        businessName: businesses.businessName,
        wifiEnabled: businesses.wifiEnabled,
        whatsappNumber: businesses.whatsappNumber,
        instagramUrl: businesses.instagramUrl,
        ownerId: businesses.ownerId,
      })
        .from(qrCodes)
        .leftJoin(businesses, eq(qrCodes.businessId, businesses.id))
        .leftJoin(qrBatches, eq(qrCodes.batchId, qrBatches.id))
        .where(eq(qrCodes.code, testCode))
        .limit(1);
      fullQueryResult = rows[0] || null;
    } catch (e) {
      fullQueryError = e.message;
    }

    // Test 5: Check businesses table columns
    let bizColumnsResult = null;
    let bizColumnsError = null;
    try {
      const rows = await db.execute(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        ORDER BY column_name
      `);
      bizColumnsResult = rows;
    } catch (e) {
      bizColumnsError = e.message;
    }

    // List all QR codes
    const allCodes = await db.select({ code: qrCodes.code, status: qrCodes.status }).from(qrCodes).orderBy(desc(qrCodes.createdAt)).limit(20);

    return NextResponse.json({
      testCode,
      allCodesInDb: allCodes.map(q => q.code),
      test1_simple: { result: simpleResult, error: simpleError },
      test2_batchJoin: { result: batchJoinResult, error: batchJoinError },
      test3_bizJoinBasic: { result: bizJoinBasicResult, error: bizJoinBasicError },
      test4_fullQuery: { result: fullQueryResult, error: fullQueryError },
      test5_bizColumns: { result: bizColumnsResult, error: bizColumnsError },
    });
  } catch (err) {
    return NextResponse.json({ fatalError: err.message }, { status: 500 });
  }
}
