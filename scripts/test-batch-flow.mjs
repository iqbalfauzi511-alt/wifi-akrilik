import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { qrCodes, qrBatches, businesses, users, scanLogs } from '../lib/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { createBatchWithQrs, getQrByCode, getAllQrsAdmin, resetQrAdmin, resetBatchAdmin, recordScanLog } from '../lib/db/queries/qr.js';
import { activateQrTransaction, updateBusinessDetails } from '../lib/db/queries/business.js';
import { getQrUrl } from '../lib/utils/qr.js';

async function runBatchTests() {
  console.log('🧪 Starting Batch QR, Public URLs, Batch Activation & Admin Reset Test Suite...\n');
  await ensureDatabaseInitialized();
  const db = getDb();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Setup Test User
    const [testUser] = await db
      .insert(users)
      .values({
        email: `batch-tester-${Date.now()}@test.com`,
        name: 'Batch Tester Cafe',
        role: 'customer',
      })
      .returning();
    assert(testUser && testUser.id, 'Created test user for batch activation');

    // 2. Test Batch Generation
    console.log('\n📦 Test 1: Batch QR Generation (5 QRs per batch):');
    const batchResult = await createBatchWithQrs(5);
    assert(batchResult.batch && batchResult.batch.batchCode.startsWith('BATCH-'), `Created batch with code: ${batchResult.batch?.batchCode}`);
    assert(batchResult.qrs.length === 5, 'Generated exactly 5 QR codes');

    const uniqueCodes = new Set(batchResult.qrs.map((q) => q.code));
    assert(uniqueCodes.size === 5, 'All 5 QR codes are unique');

    const allBlank = batchResult.qrs.every((q) => q.status === 'blank');
    assert(allBlank, 'All 5 QR codes have initial status BLANK');

    const sameBatch = batchResult.qrs.every((q) => q.batchId === batchResult.batch.id);
    assert(sameBatch, 'All 5 QR codes share identical batch_id');

    // 3. Test Public QR URL for each code
    console.log('\n🔗 Test 2: Public URL Construction:');
    const firstCode = batchResult.qrs[0].code;
    const secondCode = batchResult.qrs[1].code;
    const sampleUrl = getQrUrl(firstCode);
    assert(sampleUrl.includes(`/q/${firstCode}`), `Public URL routes to /q/[code]: ${sampleUrl}`);

    // Check QR by code lookup
    const qrLookup = await getQrByCode(firstCode);
    assert(qrLookup && qrLookup.status === 'blank', 'Lookup by code returns blank status');
    assert(qrLookup.batchCode === batchResult.batch.batchCode, `Lookup by code returns batch code: ${qrLookup.batchCode}`);

    // 4. Test Batch Activation Transaction
    console.log('\n⚡ Test 3: Batch Activation Transaction (Scan 1 -> Activate All in Batch):');
    const activationResult = await activateQrTransaction({
      userId: testUser.id,
      qrCodeValue: firstCode,
      businessData: {
        businessName: 'Kopi Senja Senayan',
        instagramUrl: 'https://www.instagram.com/kopisenjasenayan/',
        wifiName: 'KOPI SENJA SENAYAN',
        wifiPassword: 'kopisenjaaman',
      },
    });

    assert(activationResult.success, 'Activation transaction completed successfully');
    assert(activationResult.batchCount === 5, 'Batch activation updated all 5 QRs');

    // Verify all 5 QRs in the batch transitioned to active with the same businessId
    const allSiblingQrs = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.batchId, batchResult.batch.id));

    assert(allSiblingQrs.length === 5, 'Found 5 sibling QRs in batch');
    const allActive = allSiblingQrs.every((q) => q.status === 'active');
    assert(allActive, 'All 5 sibling QRs in the batch transitioned to ACTIVE status');

    const allLinked = allSiblingQrs.every((q) => q.businessId === activationResult.business.id);
    assert(allLinked, 'All 5 sibling QRs linked to the customer business ID');

    const allHaveTimestamp = allSiblingQrs.every((q) => q.activatedAt !== null);
    assert(allHaveTimestamp, 'All 5 sibling QRs have activated_at timestamp recorded');

    // 5. Test Ownership Security: Cannot Re-Activate an Active QR
    console.log('\n🔒 Test 4: Ownership Security (Reject hijacking active QR):');
    const hijackAttempt = await activateQrTransaction({
      userId: testUser.id,
      qrCodeValue: secondCode, // trying to activate sibling QR that is already active
      businessData: {
        businessName: 'Hacker Cafe',
        instagramUrl: 'https://instagram.com/hackercafe',
        wifiName: 'HACKER',
        wifiPassword: 'hacked',
      },
    });

    assert(!hijackAttempt.success, 'Hijack attempt was blocked');
    assert(
      hijackAttempt.error.includes('QR sudah diaktifkan') &&
        hijackAttempt.error.includes('terhubung dengan bisnis lain'),
      `Returned clean ownership error: "${hijackAttempt.error}"`
    );

    // 6. Test Active QR Visitor Scan & Scan Log
    console.log('\n📱 Test 5: Active QR Visitor Scan & Scan Log:');
    const activeLookup = await getQrByCode(firstCode);
    assert(activeLookup.status === 'active', 'QR status is verified ACTIVE');
    assert(activeLookup.businessName === 'Kopi Senja Senayan', 'Returns business name');
    assert(
      activeLookup.instagramUrl === 'https://www.instagram.com/kopisenjasenayan/',
      'Preserves complete instagram_url'
    );
    assert(activeLookup.wifiPassword === 'kopisenjaaman', 'Wi-Fi password available for reveal');

    const scanLog = await recordScanLog(activeLookup.id, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
    assert(scanLog && scanLog.qrId === activeLookup.id, 'Recorded visitor scan log in scan_logs');

    // 7. Test Centralized Wi-Fi Password Update
    console.log('\n📶 Test 6: Centralized Wi-Fi Password Update:');
    await updateBusinessDetails(activationResult.business.id, testUser.id, {
      wifiPassword: 'passwordbarusenja2026',
    });

    const secondQrLookup = await getQrByCode(secondCode);
    assert(
      secondQrLookup.wifiPassword === 'passwordbarusenja2026',
      'Updating business password updates all sibling QRs instantly'
    );

    // 8. Test Admin Reset Single QR
    console.log('\n🔄 Test 7: Admin Reset Single QR:');
    const targetSingleReset = allSiblingQrs[4];
    const resetSingleResult = await resetQrAdmin(targetSingleReset.id);
    assert(resetSingleResult && resetSingleResult.status === 'blank', 'Reset QR transitioned status to BLANK');
    assert(resetSingleResult.businessId === null, 'Reset QR cleared business_id');
    assert(resetSingleResult.activatedAt === null, 'Reset QR cleared activated_at');
    assert(resetSingleResult.code === targetSingleReset.code, 'Reset QR preserved physical QR code');

    // Sibling 0 should still be active
    const siblingCheck = await getQrByCode(firstCode);
    assert(siblingCheck.status === 'active', 'Sibling QR remains ACTIVE when only 1 QR is reset');

    // 9. Test Admin Reset Entire Batch
    console.log('\n📦 Test 8: Admin Reset Entire Batch:');
    const resetBatchResult = await resetBatchAdmin(batchResult.batch.id);
    assert(resetBatchResult.length === 5, 'Reset all 5 QRs in the batch');

    const refreshedBatchQrs = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.batchId, batchResult.batch.id));

    const allBlankAfterBatchReset = refreshedBatchQrs.every((q) => q.status === 'blank');
    assert(allBlankAfterBatchReset, 'All QRs in batch returned to BLANK status');

    const allUnlinked = refreshedBatchQrs.every((q) => q.businessId === null);
    assert(allUnlinked, 'All QRs in batch unlinked from business (business_id = null)');

    // Batch record itself still exists for historical inventory tracking
    const batchCheck = await db.query.qrBatches.findFirst({
      where: eq(qrBatches.id, batchResult.batch.id),
    });
    assert(batchCheck !== null, 'Batch record preserved for historical tracking');

    // Summary
    console.log(`\n========================================`);
    console.log(`📊 BATCH TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Test suite encountered fatal exception:', error);
    process.exit(1);
  }
}

runBatchTests();
