/**
 * Automated Test: Admin Data Deletion
 * 
 * Verifies:
 * 1. deleteQrAdmin(qrId) deletes QR code and associated scan logs.
 * 2. deleteBatchAdmin(batchId) deletes batch and all QRs in that batch.
 * 3. deleteBusinessAdmin(businessId) deletes business and unlinks associated QRs to BLANK.
 * 4. deleteUserAdmin(userId) protects admin accounts and deletes customer user + business.
 */

import assert from 'assert';
import { db, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrBatches, qrCodes, scanLogs } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { deleteQrAdmin, deleteBatchAdmin } from '../lib/db/queries/qr.js';
import { deleteBusinessAdmin, deleteUserAdmin } from '../lib/db/queries/business.js';

async function runTests() {
  console.log('🧪 Starting Admin Data Deletion Test Suite...\n');
  await ensureDatabaseInitialized();

  // Setup Admin user
  const adminEmail = 'distrapness@gmail.com';
  const [adminUser] = await db
    .insert(users)
    .values({
      email: adminEmail,
      name: 'Super Admin',
      role: 'admin',
    })
    .onConflictDoNothing()
    .returning();

  // ========================================================
  // TEST 1: DELETE SINGLE QR CODE
  // ========================================================
  console.log('--- Test 1: Admin Delete Single QR Code ---');
  const testQrCode = `DEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const [createdQr] = await db
    .insert(qrCodes)
    .values({
      code: testQrCode,
      status: 'blank',
    })
    .returning();

  // Add a scan log
  await db.insert(scanLogs).values({
    qrId: createdQr.id,
    userAgent: 'Test Agent',
  });

  const deletedQr = await deleteQrAdmin(createdQr.id);
  assert(deletedQr !== null, 'deleteQrAdmin must return deleted QR');
  assert(deletedQr.id === createdQr.id, 'Deleted QR id must match');

  // Verify gone from DB
  const checkQr = await db.select().from(qrCodes).where(eq(qrCodes.id, createdQr.id));
  assert(checkQr.length === 0, 'QR must be permanently removed from DB');

  const checkLogs = await db.select().from(scanLogs).where(eq(scanLogs.qrId, createdQr.id));
  assert(checkLogs.length === 0, 'Scan logs must also be deleted');
  console.log('✓ Test 1 Passed: Single QR code & scan logs successfully deleted.\n');

  // ========================================================
  // TEST 2: DELETE ENTIRE BATCH
  // ========================================================
  console.log('--- Test 2: Admin Delete Entire Batch of QRs ---');
  const batchCode = `BATCH-${Date.now()}`;
  const [createdBatch] = await db.insert(qrBatches).values({ batchCode }).returning();

  const bQr1 = `BQR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const bQr2 = `BQR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  await db.insert(qrCodes).values([
    { code: bQr1, batchId: createdBatch.id, status: 'blank' },
    { code: bQr2, batchId: createdBatch.id, status: 'blank' },
  ]);

  const batchDelRes = await deleteBatchAdmin(createdBatch.id);
  assert(batchDelRes.count === 2, 'Must report 2 QRs deleted');

  // Verify batch and QRs are gone
  const checkBatch = await db.select().from(qrBatches).where(eq(qrBatches.id, createdBatch.id));
  assert(checkBatch.length === 0, 'Batch must be deleted');

  const checkBatchQrs = await db.select().from(qrCodes).where(eq(qrCodes.batchId, createdBatch.id));
  assert(checkBatchQrs.length === 0, 'All QRs in batch must be deleted');
  console.log('✓ Test 2 Passed: Entire batch and member QRs successfully deleted.\n');

  // ========================================================
  // TEST 3: DELETE BUSINESS (UNLINKS QRs)
  // ========================================================
  console.log('--- Test 3: Admin Delete Business (Unlinks QRs to BLANK) ---');
  const custEmail = `cust-${Date.now()}@example.com`;
  const [custUser] = await db.insert(users).values({ email: custEmail, name: 'Cust Owner', role: 'customer' }).returning();

  const [testBiz] = await db.insert(businesses).values({
    ownerId: custUser.id,
    businessName: 'Resto Hapus Test',
    googleMapsReviewUrl: 'https://maps.app.goo.gl/delTest',
  }).returning();

  const linkedQrCode = `LNK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const [linkedQr] = await db.insert(qrCodes).values({
    code: linkedQrCode,
    status: 'active',
    businessId: testBiz.id,
    activatedAt: new Date(),
  }).returning();

  const deletedBiz = await deleteBusinessAdmin(testBiz.id);
  assert(deletedBiz !== null, 'deleteBusinessAdmin must return deleted business');

  // Verify business is gone
  const checkBiz = await db.select().from(businesses).where(eq(businesses.id, testBiz.id));
  assert(checkBiz.length === 0, 'Business must be deleted');

  // Verify linked QR was unlinked and reset to BLANK
  const [unlinkedQr] = await db.select().from(qrCodes).where(eq(qrCodes.id, linkedQr.id));
  assert(unlinkedQr.businessId === null, 'QR businessId must be null (unlinked)');
  assert(unlinkedQr.status === 'blank', 'QR status must be reset to blank for reuse');
  assert(unlinkedQr.activatedAt === null, 'activatedAt must be cleared');
  console.log('✓ Test 3 Passed: Business deleted and associated QRs safely reverted to BLANK.\n');

  // ========================================================
  // TEST 4: DELETE USER & ADMIN PROTECTION
  // ========================================================
  console.log('--- Test 4: Admin Delete User & Administrator Protection ---');
  // Attempt to delete admin user -> MUST BE BLOCKED
  const [adminRecord] = await db.select().from(users).where(eq(users.email, adminEmail));
  if (adminRecord) {
    const adminDelAttempt = await deleteUserAdmin(adminRecord.id, adminEmail);
    assert(adminDelAttempt.success === false, 'Deleting admin account must be blocked');
    console.log('Admin deletion protection verified: ' + adminDelAttempt.error);
  }

  // Delete customer user -> MUST SUCCEED
  const custDelRes = await deleteUserAdmin(custUser.id, adminEmail);
  assert(custDelRes.success === true, 'Customer user deletion must succeed');

  const checkCust = await db.select().from(users).where(eq(users.id, custUser.id));
  assert(checkCust.length === 0, 'Customer user must be deleted from DB');
  console.log('✓ Test 4 Passed: Customer user deleted, Administrator protected.\n');

  // Cleanup leftover QR
  await db.delete(qrCodes).where(eq(qrCodes.id, linkedQr.id));

  console.log('🎉 ALL ADMIN DELETION TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
