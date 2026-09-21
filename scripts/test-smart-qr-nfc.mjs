import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes } from '../lib/db/schema.js';
import {
  createBatchWithQrs,
  getPublicQrByCode,
  getQrWifiCredentials,
} from '../lib/db/queries/qr.js';
import {
  activateQrTransaction,
  updateBusinessDetails,
} from '../lib/db/queries/business.js';
import {
  validateGoogleMapsUrl,
  validateSmartQrInput,
} from '../lib/utils/validation.js';

// Simulate reveal-wifi API handler logic
async function simulateRevealWifi(code) {
  if (!code) {
    return { status: 404, json: { success: false, error: 'QR Code tidak ditemukan.' } };
  }
  const result = await getQrWifiCredentials(code);
  if (result.error === 'notFound') {
    return { status: 404, json: { success: false, error: 'QR Code tidak ditemukan.' } };
  }
  if (result.error === 'inactive') {
    return { status: 400, json: { success: false, error: 'QR Code ini belum diaktifkan.' } };
  }
  if (result.error === 'wifiDisabled') {
    return {
      status: 400,
      json: { success: false, error: 'Fitur Wi-Fi tidak diaktifkan oleh pemilik bisnis.' },
    };
  }
  if (result.error === 'noBusiness') {
    return { status: 404, json: { success: false, error: 'Data bisnis tidak ditemukan.' } };
  }
  if (!result.success || !result.wifi_password) {
    return {
      status: 500,
      json: { success: false, error: 'Maaf, password Wi-Fi belum bisa ditampilkan. Silakan coba lagi.' },
    };
  }
  return {
    status: 200,
    json: {
      success: true,
      wifi_name: result.wifi_name,
      wifi_password: result.wifi_password,
    },
  };
}

async function runSmartQrNfcTestSuite() {
  console.log('🚀 Starting Smart QR + NFC Comprehensive Test Suite...\n');
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
    // -------------------------------------------------------------
    // TEST SUITE 1: Validation Engine Tests
    // -------------------------------------------------------------
    console.log('--- 1. Validation Engine ---');

    // 1.1 Google Maps Valid URLs
    const validMap1 = validateGoogleMapsUrl('https://maps.app.goo.gl/abCdEfG123');
    assert(validMap1.isValid, 'Accepts maps.app.goo.gl short links');

    const validMap2 = validateGoogleMapsUrl('https://maps.google.com/?cid=123456789');
    assert(validMap2.isValid, 'Accepts maps.google.com query URLs');

    const validMap3 = validateGoogleMapsUrl('https://www.google.com/maps/place/Kopi+Senja');
    assert(validMap3.isValid, 'Accepts google.com/maps URLs');

    // 1.2 Invalid Maps URLs
    const invalidMap1 = validateGoogleMapsUrl('https://instagram.com/kopisenja');
    assert(!invalidMap1.isValid, 'Rejects non-google domain (instagram.com)');

    const invalidMap2 = validateGoogleMapsUrl('just-a-plain-string');
    assert(!invalidMap2.isValid, 'Rejects non-URL strings without http/https');

    // 1.3 Smart QR Input Validation without Wi-Fi (Wi-Fi optional)
    const validNoWifi = validateSmartQrInput({
      businessName: 'Klinik Medika',
      googleMapsUrl: 'https://maps.app.goo.gl/klinik123',
      wifiEnabled: false,
    });
    assert(validNoWifi.isValid, 'Validates cleanly when wifiEnabled is false without Wi-Fi credentials');
    assert(validNoWifi.sanitized.wifiName === null, 'wifiName is null when wifiEnabled is false');
    assert(validNoWifi.sanitized.wifiPassword === null, 'wifiPassword is null when wifiEnabled is false');

    // 1.4 Smart QR Input Validation with Wi-Fi (Wi-Fi required fields)
    const invalidWithWifi = validateSmartQrInput({
      businessName: 'Kopi Kenangan',
      googleMapsUrl: 'https://maps.app.goo.gl/kopi123',
      wifiEnabled: true,
      wifiName: '',
      wifiPassword: '',
    });
    assert(!invalidWithWifi.isValid, 'Rejects activation if wifiEnabled is true but Wi-Fi fields are empty');
    assert(!!invalidWithWifi.errors.wifiName, 'Provides error for missing wifiName');
    assert(!!invalidWithWifi.errors.wifiPassword, 'Provides error for missing wifiPassword');

    const validWithWifi = validateSmartQrInput({
      businessName: 'Kopi Kenangan',
      googleMapsUrl: 'https://maps.app.goo.gl/kopi123',
      wifiEnabled: true,
      wifiName: 'Kopi Kenangan Free',
      wifiPassword: 'kopikenangan123',
    });
    assert(validWithWifi.isValid, 'Validates successfully when wifiEnabled is true and credentials provided');

    // -------------------------------------------------------------
    // TEST SUITE 2: Activation & Zero Password Leakage (No Wi-Fi)
    // -------------------------------------------------------------
    console.log('\n--- 2. Activation: Smart QR without Wi-Fi (Retail / Clinic style) ---');

    // Create test customer
    const [userA] = await db
      .insert(users)
      .values({
        email: `smartqr-user-a-${Date.now()}@test.com`,
        name: 'Merchant No Wi-Fi',
        role: 'customer',
      })
      .returning();

    // Create batch of 2 QRs
    const batchA = await createBatchWithQrs(2);
    const qrA1 = batchA.qrs[0];
    const qrA2 = batchA.qrs[1];

    // Activate QR A1 with Maps only
    const activationA = await activateQrTransaction({
      userId: userA.id,
      qrCodeValue: qrA1.code,
      businessData: validNoWifi.sanitized,
    });
    assert(activationA.success, 'Successfully activated Smart QR batch with Maps only');
    assert(activationA.batchCount === 2, 'Batch activation activated all sibling QRs in batch');

    // Public QR Fetch (simulate visitor scan initial page load)
    const publicDataA = await getPublicQrByCode(qrA1.code);
    assert(publicDataA.code === qrA1.code, 'Public QR returns correct code');
    assert(publicDataA.googleMapsUrl === 'https://maps.app.goo.gl/klinik123', 'Public QR returns googleMapsUrl');
    assert(publicDataA.wifiEnabled === false, 'Public QR has wifiEnabled = false');
    assert(publicDataA.wifiPassword === undefined, 'ZERO LEAKAGE: wifiPassword is NOT present on public QR data');

    // Reveal API attempt on Wi-Fi disabled business
    const revealA = await simulateRevealWifi(qrA1.code);
    assert(revealA.status === 400, 'Reveal Wi-Fi returns 400 when wifiEnabled is false');
    assert(revealA.json.error.includes('tidak diaktifkan'), 'Reveal Wi-Fi returns wifiDisabled error message');

    // -------------------------------------------------------------
    // TEST SUITE 3: Activation & Wi-Fi Gate (With Wi-Fi)
    // -------------------------------------------------------------
    console.log('\n--- 3. Activation: Smart QR with Wi-Fi (Cafe / Restaurant style) ---');

    const [userB] = await db
      .insert(users)
      .values({
        email: `smartqr-user-b-${Date.now()}@test.com`,
        name: 'Cafe Owner With Wi-Fi',
        role: 'customer',
      })
      .returning();

    const batchB = await createBatchWithQrs(2);
    const qrB1 = batchB.qrs[0];

    const activationB = await activateQrTransaction({
      userId: userB.id,
      qrCodeValue: qrB1.code,
      businessData: validWithWifi.sanitized,
    });
    assert(activationB.success, 'Successfully activated Smart QR batch with Wi-Fi enabled');

    // Public QR Fetch
    const publicDataB = await getPublicQrByCode(qrB1.code);
    assert(publicDataB.wifiEnabled === true, 'Public QR has wifiEnabled = true');
    assert(publicDataB.wifiName === 'Kopi Kenangan Free', 'Public QR returns wifiName (SSID)');
    assert(publicDataB.wifiPassword === undefined, 'ZERO LEAKAGE: wifiPassword is STILL NOT present on initial public load');

    // Reveal API on Wi-Fi enabled business (visitor clicked "Saya Sudah Memberikan Rating")
    const revealB = await simulateRevealWifi(qrB1.code);
    assert(revealB.status === 200, 'Reveal Wi-Fi succeeds with status 200');
    assert(revealB.json.wifi_name === 'Kopi Kenangan Free', 'Reveal Wi-Fi returns correct SSID');
    assert(revealB.json.wifi_password === 'kopikenangan123', 'Reveal Wi-Fi returns correct Wi-Fi password');

    // -------------------------------------------------------------
    // TEST SUITE 4: Settings Update & Instant Dynamic Reflection
    // -------------------------------------------------------------
    console.log('\n--- 4. Settings Update & Dynamic Reusable QR ---');

    const businessBId = activationB.business.id;

    // Owner updates Wi-Fi password and Google Maps URL in dashboard
    const updatedBiz = await updateBusinessDetails(businessBId, userB.id, {
      googleMapsUrl: 'https://maps.app.goo.gl/new-location-456',
      wifiPassword: 'new-password-789',
    });
    assert(updatedBiz !== null, 'Business details updated successfully');

    // Public visitor immediately sees updated data without changing physical QR
    const publicDataBUpdated = await getPublicQrByCode(qrB1.code);
    assert(
      publicDataBUpdated.googleMapsUrl === 'https://maps.app.goo.gl/new-location-456',
      'Public QR instantly reflects updated Google Maps URL'
    );

    const revealBUpdated = await simulateRevealWifi(qrB1.code);
    assert(
      revealBUpdated.json.wifi_password === 'new-password-789',
      'Reveal Wi-Fi instantly returns the newly updated Wi-Fi password'
    );

    // Owner turns Wi-Fi OFF in settings
    await updateBusinessDetails(businessBId, userB.id, {
      wifiEnabled: false,
    });
    const publicDataBDisabled = await getPublicQrByCode(qrB1.code);
    assert(publicDataBDisabled.wifiEnabled === false, 'Wi-Fi can be cleanly disabled later');
    const revealBDisabled = await simulateRevealWifi(qrB1.code);
    assert(revealBDisabled.status === 400, 'Reveal Wi-Fi is immediately blocked after being turned off');

    // Clean up test records
    const { inArray } = await import('drizzle-orm');
    await db.delete(qrCodes).where(inArray(qrCodes.batchId, [batchA.batch.id, batchB.batch.id]));
    await db.delete(businesses).where(inArray(businesses.ownerId, [userA.id, userB.id]));
    await db.delete(users).where(inArray(users.id, [userA.id, userB.id]));

    console.log(`\n🎉 Test Suite Completed! Passed: ${passed}, Failed: ${failed}`);
    process.exit(0);
  } catch (error) {
    console.error('💥 Unhandled error in test suite:', error);
    process.exit(1);
  }
}

runSmartQrNfcTestSuite();
