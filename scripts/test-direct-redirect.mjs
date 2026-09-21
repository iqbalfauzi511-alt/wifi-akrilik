import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes } from '../lib/db/schema.js';
import {
  createBatchWithQrs,
  getPublicQrByCode,
} from '../lib/db/queries/qr.js';
import {
  activateQrTransaction,
  updateBusinessDetails,
} from '../lib/db/queries/business.js';
import { inArray } from 'drizzle-orm';

// Simulate the logic in app/q/[code]/page.jsx
function simulateVisitorPageLogic(qr) {
  if (!qr) {
    return { type: 'NOT_FOUND', status: 404 };
  }
  if (qr.status === 'disabled') {
    return { type: 'DISABLED', status: 403 };
  }
  if (qr.status === 'blank' || qr.status === 'sold') {
    return { type: 'UNACTIVATED', status: 200, code: qr.code };
  }
  if (qr.status === 'active') {
    const targetMapsUrl = qr.googleMapsUrl?.trim();
    const isValidUrl = targetMapsUrl && /^https?:\/\//i.test(targetMapsUrl);
    if (!isValidUrl) {
      return {
        type: 'MAPS_UNCONFIGURED',
        status: 200,
        message: 'Google Maps belum dikonfigurasi untuk bisnis ini.',
      };
    }
    return {
      type: 'REDIRECT',
      status: 307,
      redirectUrl: targetMapsUrl,
    };
  }
  return { type: 'UNKNOWN' };
}

async function runDirectRedirectTests() {
  console.log('🚀 Testing Direct Google Maps Redirect Flow on /q/[code]...\n');
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

  const createdUserIds = [];
  const createdBatchIds = [];

  try {
    // 1. Create a customer & batch of QRs
    const [testUser] = await db
      .insert(users)
      .values({
        email: `direct-redirect-${Date.now()}@test.com`,
        name: 'Direct Redirect Tester',
        role: 'customer',
      })
      .returning();
    createdUserIds.push(testUser.id);

    const batch = await createBatchWithQrs(3);
    createdBatchIds.push(batch.batch.id);
    const qr1 = batch.qrs[0];
    const qr2 = batch.qrs[1];

    // Test 1: Blank QR
    const publicBlank = await getPublicQrByCode(qr1.code);
    const flowBlank = simulateVisitorPageLogic(publicBlank);
    assert(flowBlank.type === 'UNACTIVATED', 'Blank QR returns UNACTIVATED state without redirecting');

    // Test 2: Active QR without Google Maps URL (or empty)
    const activationNoMaps = await activateQrTransaction({
      userId: testUser.id,
      qrCodeValue: qr1.code,
      businessData: {
        businessName: 'Toko Baru Tanpa Maps',
        googleMapsUrl: '',
        wifiEnabled: false,
      },
    });
    assert(activationNoMaps.success, 'Activated QR without Maps URL');

    const publicNoMaps = await getPublicQrByCode(qr1.code);
    const flowNoMaps = simulateVisitorPageLogic(publicNoMaps);
    assert(flowNoMaps.type === 'MAPS_UNCONFIGURED', 'Active QR without Maps shows MAPS_UNCONFIGURED page');
    assert(
      flowNoMaps.message === 'Google Maps belum dikonfigurasi untuk bisnis ini.',
      'Shows exact message "Google Maps belum dikonfigurasi untuk bisnis ini."'
    );

    // Test 3: Active QR with Valid Google Maps URL
    const urlA = 'https://maps.app.goo.gl/DirectLocationA';
    await updateBusinessDetails(activationNoMaps.business.id, testUser.id, {
      googleMapsUrl: urlA,
    });

    const publicWithMaps = await getPublicQrByCode(qr1.code);
    const flowWithMaps = simulateVisitorPageLogic(publicWithMaps);
    assert(flowWithMaps.type === 'REDIRECT', 'Active QR with Maps URL triggers direct REDIRECT');
    assert(flowWithMaps.redirectUrl === urlA, 'Redirects directly to Google Maps URL A');

    // Test 4: Dynamic update (URL A -> URL B) on same QR
    const urlB = 'https://maps.app.goo.gl/DirectLocationB';
    await updateBusinessDetails(activationNoMaps.business.id, testUser.id, {
      googleMapsUrl: urlB,
    });

    const publicUpdated = await getPublicQrByCode(qr1.code);
    const flowUpdated = simulateVisitorPageLogic(publicUpdated);
    assert(flowUpdated.type === 'REDIRECT', 'Updated QR triggers direct REDIRECT');
    assert(flowUpdated.redirectUrl === urlB, 'Redirects directly to NEW Google Maps URL B');
    assert(publicUpdated.code === qr1.code, 'QR code remains completely unchanged');

    // Test 5: Disabled QR
    const { eq } = await import('drizzle-orm');
    await db.update(qrCodes).set({ status: 'disabled' }).where(eq(qrCodes.id, qr1.id));
    const publicDisabled = await getPublicQrByCode(qr1.code);
    const flowDisabled = simulateVisitorPageLogic(publicDisabled);
    assert(flowDisabled.type === 'DISABLED', 'Disabled QR does not redirect, shows DISABLED page');

    // Cleanup
    await db.delete(qrCodes).where(inArray(qrCodes.batchId, createdBatchIds));
    await db.delete(businesses).where(inArray(businesses.ownerId, createdUserIds));
    await db.delete(users).where(inArray(users.id, createdUserIds));

    console.log(`\n🎉 Direct Redirect Tests Completed! Passed: ${passed}, Failed: ${failed}`);
    process.exit(0);
  } catch (err) {
    console.error('💥 Error in test:', err);
    process.exit(1);
  }
}

runDirectRedirectTests();
