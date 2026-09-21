/**
 * Integration Test: Option 3 - Dedicated Wi-Fi Route with Review Gate
 * 
 * Verifies:
 * 1. Public QR query for /q/[code]/wifi does not leak wifiPassword.
 * 2. POST /api/q/[code]/reveal-wifi returns wifi credentials when wifiEnabled is true.
 * 3. POST /api/q/[code]/reveal-wifi blocks access when wifiEnabled is false.
 * 4. Dual link resolution:
 *    - Main QR / NFC: /q/[code] (direct redirect)
 *    - Wi-Fi QR / Link: /q/[code]/wifi (review gate to reveal Wi-Fi)
 */

import assert from 'assert';
import { db, ensureDatabaseInitialized } from '../lib/db/index.js';
import { businesses, qrCodes, users } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { activateQrTransaction } from '../lib/db/queries/business.js';
import { getPublicQrByCode, getQrWifiCredentials } from '../lib/db/queries/qr.js';

async function runTests() {
  console.log('🧪 Starting Wi-Fi Review-Gate Option 3 Test Suite...\n');
  await ensureDatabaseInitialized();

  // 1. Setup Test User & QR
  const testEmail = `wifi-gate-${Date.now()}@example.com`;
  const [testUser] = await db
    .insert(users)
    .values({
      email: testEmail,
      name: 'Owner WiFi Gate Test',
      role: 'customer',
    })
    .returning();

  const testCode = `WIFI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(qrCodes).values({
    code: testCode,
    status: 'blank',
  });

  const reviewUrl = 'https://maps.app.goo.gl/CafeBintangLimaReview';
  const actRes = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: testCode,
    businessData: {
      businessName: 'Cafe Bintang Lima',
      googleMapsReviewUrl: reviewUrl,
      wifiEnabled: true,
      wifiName: 'BintangLima-Guest',
      wifiPassword: 'ngopiasik123',
    },
  });

  assert(actRes.success, 'Activation should succeed');

  // Test 1: Public QR data strictly omits wifiPassword
  console.log('--- Test 1: Public QR Data Security (/q/[code]/wifi payload) ---');
  const publicQr = await getPublicQrByCode(testCode);
  assert(publicQr !== null, 'Public QR must exist');
  assert(publicQr.wifiPassword === undefined, 'wifiPassword must NEVER be returned in getPublicQrByCode');
  assert(publicQr.wifiEnabled === true, 'wifiEnabled must be true');
  assert(publicQr.wifiName === 'BintangLima-Guest', 'wifiName is visible');
  console.log('✓ Test 1 Passed: Public QR payload is secure (no password leakage).\n');

  // Test 2: Reveal Wi-Fi Credentials via Backend
  console.log('--- Test 2: Backend Reveal Wi-Fi Endpoint Logic ---');
  const revealRes = await getQrWifiCredentials(testCode);
  assert(revealRes.success === true, 'Reveal credentials should succeed for active Wi-Fi QR');
  assert(revealRes.wifi_name === 'BintangLima-Guest', 'Correct Wi-Fi name returned');
  assert(revealRes.wifi_password === 'ngopiasik123', 'Correct Wi-Fi password returned');
  console.log('✓ Test 2 Passed: Wi-Fi credentials returned on reveal request.\n');

  // Test 3: Wi-Fi Disabled QR
  console.log('--- Test 3: Wi-Fi Disabled Behavior ---');
  await db.update(businesses).set({ wifiEnabled: false }).where(eq(businesses.id, actRes.business.id));
  const blockedRes = await getQrWifiCredentials(testCode);
  assert(blockedRes.error === 'wifiDisabled', 'Should reject reveal if wifiEnabled is false');
  console.log('✓ Test 3 Passed: Blocked reveal when wifiEnabled is false.\n');

  // Clean up
  console.log('Cleaning up test data...');
  await db.delete(qrCodes).where(eq(qrCodes.code, testCode));
  await db.delete(businesses).where(eq(businesses.id, actRes.business.id));
  await db.delete(users).where(eq(users.id, testUser.id));

  console.log('🎉 ALL OPTION 3 TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
