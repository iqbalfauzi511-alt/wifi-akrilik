import { NextResponse } from 'next/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Temporary diagnostic: list all QR codes in database — DELETE AFTER DEBUG
export async function GET() {
  try {
    await ensureDatabaseInitialized();
    const allQrs = await db
      .select({
        id: qrCodes.id,
        code: qrCodes.code,
        status: qrCodes.status,
        createdAt: qrCodes.createdAt,
      })
      .from(qrCodes)
      .orderBy(desc(qrCodes.createdAt))
      .limit(50);

    return NextResponse.json({
      count: allQrs.length,
      codes: allQrs.map(q => ({
        code: q.code,
        status: q.status,
        createdAt: q.createdAt,
        url: `https://cobascan.my.id/q/${q.code}`,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
