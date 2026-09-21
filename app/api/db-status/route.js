import { NextResponse } from 'next/server';
import { db, getDb } from '@/lib/db';
import { qrCodes, qrBatches, users, businesses } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rawUrl = process.env.DATABASE_URL || '';
  const hasDbUrl = Boolean(rawUrl);
  const startsWithPostgres = rawUrl.startsWith('postgres');
  
  // Mask password for security: postgres://user:***@host:port/db
  let maskedUrl = '';
  if (hasDbUrl) {
    try {
      const parsed = new URL(rawUrl);
      maskedUrl = `${parsed.protocol}//${parsed.username}:****@${parsed.host}${parsed.pathname}`;
    } catch {
      maskedUrl = rawUrl.substring(0, 15) + '... (invalid URL format)';
    }
  }

  let dbType = 'unknown';
  let connectionSuccess = false;
  let connectionError = null;
  let qrCount = 0;
  let batchCount = 0;

  try {
    const database = getDb();
    dbType = startsWithPostgres ? 'postgresql-supabase' : 'pglite-temporary';

    // Test a basic query
    const testResult = await database.execute(sql`SELECT 1 as test`);
    connectionSuccess = Boolean(testResult);

    // Count QRs in the database
    const qrs = await database.select({ count: sql`count(*)` }).from(qrCodes);
    qrCount = Number(qrs[0]?.count || 0);

    const batches = await database.select({ count: sql`count(*)` }).from(qrBatches);
    batchCount = Number(batches[0]?.count || 0);
  } catch (err) {
    connectionError = err.message || String(err);
  }

  return NextResponse.json({
    hasDatabaseUrl: hasDbUrl,
    databaseUrlMasked: maskedUrl,
    mode: dbType,
    isPermanentSupabase: startsWithPostgres,
    connectionSuccess,
    connectionError,
    qrCount,
    batchCount,
    timestamp: new Date().toISOString(),
    envKeysPresent: {
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      DATABASE_URL: hasDbUrl,
    },
  });
}
