import { ensureDatabaseInitialized, getDb } from '../lib/db/index.js';
import { qrCodes, qrBatches, businesses, users } from '../lib/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import {
  generateQrCode,
  generateBatchQrCodes,
  generateBatchCode,
} from '../lib/utils/code-generator.js';
import {
  validateBusinessInput,
  validateSmartQrInput,
} from '../lib/utils/validation.js';
import {
  createBatchWithQrs,
  bulkInsertQrs,
  updateQrStatus,
  getQrByCode,
  getPublicQrByCode,
  resetQrAdmin,
} from '../lib/db/queries/qr.js';
import {
  activateQrTransaction,
  updateBusinessDetails,
  getBusinessByOwnerId,
} from '../lib/db/queries/business.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runSpecs() {
  console.log('=== TEST SUITE: COBASCAN PRODUCTION SPECS & BUSINESS LOGO ===\n');

  await ensureDatabaseInitialized();
  const db = getDb();

  // 1. Code Generator Tests
  console.log('--- 1. Testing Code Generation & Formats ---');
  const sampleCode = generateQrCode();
  assert(sampleCode.startsWith('CS-'), `Code starts with CS- prefix (${sampleCode})`);
  assert(sampleCode.length === 9, `Code length is 9 chars (${sampleCode})`);

  const sampleBatchCode = generateBatchCode(1);
  assert(sampleBatchCode.startsWith('CS-BATCH-'), `Batch code starts with CS-BATCH- (${sampleBatchCode})`);

  const batchCodes13 = generateBatchQrCodes(13);
  assert(batchCodes13.length === 13, `Generated exactly 13 unique codes`);
  const uniqueSet = new Set(batchCodes13);
  assert(uniqueSet.size === 13, `All 13 generated codes are distinct`);

  // 2. Arbitrary Batch Generation & Atomic Transaction
  console.log('\n--- 2. Testing Arbitrary Batch Quantities (1, 7, 13, 25) ---');
  for (const qty of [1, 7, 13, 25]) {
    const result = await createBatchWithQrs(qty);
    assert(result.qrs.length === qty, `createBatchWithQrs(${qty}) generated exactly ${qty} units in memory`);
    const dbCount = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.batchId, result.batch.id));
    assert(dbCount.length === qty, `Database contains exactly ${qty} units for batch ${result.batch.batchCode}`);
    assert(result.batch.batchCode.startsWith('CS-BATCH-'), `Batch has CS-BATCH- code: ${result.batch.batchCode}`);
  }

  // 3. Validation Tests
  console.log('\n--- 3. Testing Validation (Quantities, Maps, Logo) ---');
  // Quantity check helper test logic
  function testQtyValidation(raw) {
    const rawStr = (raw || '').toString().trim();
    if (!rawStr) return { valid: false, error: 'Jumlah QR tidak boleh kosong.' };
    const num = Number(rawStr);
    if (!Number.isInteger(num) || num < 1) return { valid: false, error: 'Jumlah QR harus berupa angka bulat minimal 1.' };
    if (num > 1000) return { valid: false, error: 'Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit.' };
    return { valid: true, qty: num };
  }

  assert(!testQtyValidation('').valid, 'Empty quantity rejected');
  assert(!testQtyValidation('0').valid, 'Quantity 0 rejected');
  assert(!testQtyValidation('-5').valid, 'Negative quantity rejected');
  assert(!testQtyValidation('1.5').valid, 'Decimal 1.5 rejected');
  assert(!testQtyValidation('abc').valid, 'Non-number abc rejected');
  assert(!testQtyValidation('1001').valid, 'Quantity > 1000 rejected');
  assert(testQtyValidation('1').valid && testQtyValidation('1').qty === 1, 'Quantity 1 accepted');
  assert(testQtyValidation('7').valid && testQtyValidation('7').qty === 7, 'Quantity 7 accepted');
  assert(testQtyValidation('13').valid && testQtyValidation('13').qty === 13, 'Quantity 13 accepted');

  // Business Input & Logo Validation
  const validLogoInput = validateBusinessInput({
    businessName: 'Cafe Senja Cobascan',
    logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
    googleMapsReviewUrl: 'https://maps.app.goo.gl/kopi123',
    wifiEnabled: true,
    wifiName: 'CafeSenja_Guest',
    wifiPassword: 'password123',
  });
  assert(validLogoInput.isValid, 'Valid business input with logo accepted');
  assert(validLogoInput.sanitized.logoUrl === 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb', 'Logo URL sanitized correctly');

  // Base64 data URL validation
  const sampleDataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=';
  const dataUrlInput = validateBusinessInput({
    businessName: 'Cafe Senja Cobascan',
    logoUrl: sampleDataUrl,
    googleMapsReviewUrl: 'https://maps.app.goo.gl/kopi123',
  });
  assert(dataUrlInput.isValid, 'Data URL logo accepted');
  assert(dataUrlInput.sanitized.logoUrl === sampleDataUrl, 'Data URL preserved accurately');

  // Invalid logo format rejection
  const invalidLogoInput = validateBusinessInput({
    businessName: 'Cafe Senja Cobascan',
    logoUrl: 'javascript:alert(1)',
    googleMapsReviewUrl: 'https://maps.app.goo.gl/kopi123',
  });
  assert(!invalidLogoInput.isValid, 'Dangerous javascript: URL logo rejected');

  // 4. Lifecycle Test: BLANK -> SOLD -> ACTIVE -> RESET
  console.log('\n--- 4. Testing QR Lifecycle & Reset ---');
  // Create test user
  const [testUser] = await db
    .insert(users)
    .values({
      email: `test-specs-${Date.now()}@example.com`,
      name: 'Tester Cobascan',
      role: 'customer',
    })
    .returning();

  // Create single QR
  const [singleQr] = await db
    .insert(qrCodes)
    .values({
      code: generateQrCode(),
      status: 'blank',
    })
    .returning();

  assert(singleQr.status === 'blank', `Initial status is BLANK (${singleQr.code})`);

  // Update to SOLD
  await updateQrStatus(singleQr.id, 'sold');
  const soldQr = await getQrByCode(singleQr.code);
  assert(soldQr.status === 'sold', `Status updated to SOLD`);

  // Activate QR with Business and Logo!
  const activationRes = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: singleQr.code,
    businessData: {
      businessName: 'Kopi Senja Utama',
      logoUrl: sampleDataUrl,
      googleMapsReviewUrl: 'https://maps.app.goo.gl/kopisenja',
      wifiEnabled: true,
      wifiName: 'KopiSenja_WiFi',
      wifiPassword: 'kopisenjaaman',
    },
  });

  assert(activationRes.success, 'QR activation successful');
  assert(activationRes.qr.status === 'active', 'QR status changed to ACTIVE');
  assert(activationRes.business.logoUrl === sampleDataUrl, 'Business logo saved during activation');

  // Verify getPublicQrByCode returns logoUrl
  const publicQr = await getPublicQrByCode(singleQr.code);
  assert(publicQr.logoUrl === sampleDataUrl, 'getPublicQrByCode returns logoUrl for visitor page');
  assert(publicQr.businessName === 'Kopi Senja Utama', 'getPublicQrByCode returns businessName');
  assert(publicQr.wifiPassword === undefined, 'getPublicQrByCode strictly protects wifiPassword');

  // Update logo via updateBusinessDetails
  const newLogoUrl = 'https://cobascan.id/logos/new-logo.png';
  const updatedBiz = await updateBusinessDetails(activationRes.business.id, testUser.id, {
    logoUrl: newLogoUrl,
  });
  assert(updatedBiz.logoUrl === newLogoUrl, 'updateBusinessDetails updated logoUrl');

  const publicQrAfterUpdate = await getPublicQrByCode(singleQr.code);
  assert(publicQrAfterUpdate.logoUrl === newLogoUrl, 'Visitor public QR immediately displays updated logo without physical reprint');

  // Reset QR
  const resetResult = await resetQrAdmin(singleQr.id);
  assert(resetResult.status === 'blank', 'Reset QR sets status back to blank');
  assert(resetResult.businessId === null, 'Reset QR clears business_id linkage');
  assert(resetResult.code === singleQr.code, 'Reset QR preserves exact physical unique code for hardware reuse');

  // Cleanup test artifacts
  await db.delete(qrCodes).where(eq(qrCodes.id, singleQr.id));
  await db.delete(businesses).where(eq(businesses.id, activationRes.business.id));
  await db.delete(users).where(eq(users.id, testUser.id));

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSpecs().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
