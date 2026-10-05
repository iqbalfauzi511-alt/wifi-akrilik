import { db, ensureDatabaseInitialized } from './lib/db/index.js';
import { businesses } from './lib/db/schema.js';

async function main() {
  console.log('Testing DB connection...');
  try {
    await ensureDatabaseInitialized();
    console.log('Init done. Querying businesses...');
    const result = await db.select().from(businesses).limit(1);
    console.log('Query success! Got result length:', result.length);
  } catch (err) {
    console.error('DB error:', err);
  }
  process.exit(0);
}

main();
