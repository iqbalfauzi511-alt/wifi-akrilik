import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes, scanLogs, qrBatches } from '../lib/db/schema.js';

async function main() {
  await ensureDatabaseInitialized();
  const db = getDb();

  const allUsers = await db.select().from(users);
  console.log('=== USERS (' + allUsers.length + ') ===');
  console.log(allUsers);

  const allBusinesses = await db.select().from(businesses);
  console.log('=== BUSINESSES (' + allBusinesses.length + ') ===');
  console.log(allBusinesses);

  const allBatches = await db.select().from(qrBatches);
  console.log('=== BATCHES (' + allBatches.length + ') ===');
  console.log(allBatches);

  const allQrs = await db.select().from(qrCodes);
  console.log('=== QR CODES (' + allQrs.length + ') ===');
  console.log(allQrs.map(q => ({ id: q.id, code: q.code, status: q.status, businessId: q.businessId, batchId: q.batchId })));

  const allScans = await db.select().from(scanLogs);
  console.log('=== SCAN LOGS (' + allScans.length + ') ===');
  console.log('Total scans: ' + allScans.length);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
