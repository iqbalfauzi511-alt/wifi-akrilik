import { NextResponse } from 'next/server';
import { getDb, ensureDatabaseInitialized } from '@/lib/db';
import { qrCodes, qrBatches } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Temporary public diagnostic endpoint — remove auth check for debugging
export async function GET() {
  const rawUrl = process.env.DATABASE_URL || '';
  const hasDbUrl = Boolean(rawUrl);
  const startsWithPostgres = rawUrl.startsWith('postgres');
  const isLocalhost = rawUrl.includes('localhost');

  let maskedUrl = '(not set)';
  if (hasDbUrl) {
    try {
      const parsed = new URL(rawUrl);
      maskedUrl = `${parsed.protocol}//${parsed.username}:****@${parsed.host}${parsed.pathname}`;
    } catch {
      maskedUrl = rawUrl.substring(0, 30) + '... (invalid format)';
    }
  }

  let dbType = 'unknown';
  let connectionSuccess = false;
  let connectionError = null;
  let qrCount = 0;
  let batchCount = 0;

  try {
    const database = getDb();
    dbType = startsWithPostgres && !isLocalhost ? 'postgresql-supabase' : 'pglite-temporary';
    await ensureDatabaseInitialized();

    const testResult = await database.execute(sql`SELECT 1 as test`);
    connectionSuccess = Boolean(testResult);

    const qrs = await database.select({ count: sql`count(*)` }).from(qrCodes);
    qrCount = Number(qrs[0]?.count || 0);

    const batches = await database.select({ count: sql`count(*)` }).from(qrBatches);
    batchCount = Number(batches[0]?.count || 0);
  } catch (err) {
    connectionError = err.message || String(err);
  }

  return NextResponse.json({
    status: connectionSuccess ? 'OK' : 'ERROR',
    hasDatabaseUrl: hasDbUrl,
    databaseUrlMasked: maskedUrl,
    isLocalhost,
    mode: dbType,
    isPermanentSupabase: startsWithPostgres && !isLocalhost,
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
      DATABASE_URL_STARTS_WITH_POSTGRES: startsWithPostgres,
      DATABASE_URL_IS_LOCALHOST: isLocalhost,
    },
  });
}
