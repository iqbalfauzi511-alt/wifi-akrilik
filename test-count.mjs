import { db, ensureDatabaseInitialized } from './lib/db/index.js';
import { businesses } from './lib/db/schema.js';
import { sql } from 'drizzle-orm';

async function run() {
  await ensureDatabaseInitialized();
  const [bizCountResult] = await db
    .select({ count: sql`cast(count(${businesses.id}) as integer)` })
    .from(businesses);
  console.log('bizCountResult:', bizCountResult);
  process.exit(0);
}
run();
