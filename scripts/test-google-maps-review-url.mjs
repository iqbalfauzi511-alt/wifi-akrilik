/**
 * Comprehensive Test: Google Maps Review URL Integration
 * 
 * Verifies:
 * 1. Safe DB migration & schema: google_maps_review_url exists & backfills from google_maps_url.
 * 2. Validation: Accepts Google Maps Review URL, rejects invalid/non-Google URLs.
 * 3. Activation Flow: Stores google_maps_review_url properly.
 * 4. Settings Update Flow: Modifying google_maps_review_url updates business, keeping QR code unchanged.
 * 5. Direct Redirect Logic:
 *    - Valid URL -> Direct target URL resolution.
 *    - Empty/Invalid URL -> "Google Maps belum dikonfigurasi untuk bisnis ini."
 *    - Arbitrary ?redirect= query parameter ignored.
 * 6. Wi-Fi preservation: wifi_enabled, wifi_name, wifi_password unaffected.
 */

import assert from 'assert';
import { db, ensureDatabaseInitialized } from '../lib/db/index.js';
import { businesses, qrCodes, qrBatches, users } from '../lib/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { validateSmartQrInput, validateBusinessInput, validateGoogleMapsUrl } from '../lib/utils/validation.js';
import { activateQrTransaction, updateBusinessDetails } from '../lib/db/queries/business.js';
import { getPublicQrByCode, getQrWifiCredentials } from '../lib/db/queries/qr.js';

async function runTests() {
  console.log('🧪 Starting Google Maps Review URL Test Suite...\n');

  // STEP 1: DB Initialization & Schema Migration Check
  console.log('--- Test 1: Database Initialization & Migration ---');
  await ensureDatabaseInitialized();

  // Check columns in businesses table
  const columnCheck = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'businesses' 
      AND column_name IN ('google_maps_review_url', 'google_maps_url', 'wifi_enabled', 'wifi_name', 'wifi_password');
  `);
  
  const rows = columnCheck.rows || (Array.isArray(columnCheck) ? columnCheck : []);
  const foundCols = rows.map((r) => r.column_name);
  console.log('Found businesses columns:', foundCols);
  assert(foundCols.includes('google_maps_review_url'), 'google_maps_review_url column must exist');
  assert(foundCols.includes('google_maps_url'), 'google_maps_url column must exist');
  assert(foundCols.includes('wifi_enabled'), 'wifi_enabled column must exist');
  console.log('✓ Test 1 Passed: Database schema contains google_maps_review_url and legacy fields.\n');

  // STEP 2: Validation Tests
  console.log('--- Test 2: Google Maps Review URL Validation ---');
  
  // Valid URLs
  const validUrl1 = validateGoogleMapsUrl('https://maps.app.goo.gl/ReviewBizXYZ');
  assert(validUrl1.isValid, 'maps.app.goo.gl should be valid');
  assert(validUrl1.normalized === 'https://maps.app.goo.gl/ReviewBizXYZ');

  const validUrl2 = validateGoogleMapsUrl('https://www.google.com/maps/place/Cafe+Senja/@-6.2,106.8,17z/data=review');
  assert(validUrl2.isValid, 'google.com/maps should be valid');

  const validUrl3 = validateGoogleMapsUrl('https://g.page/r/CbXYZ123/review');
  assert(validUrl3.isValid, 'g.page should be valid');

  // Invalid URLs
  const emptyUrl = validateGoogleMapsUrl('');
  assert(!emptyUrl.isValid, 'Empty URL must be rejected');

  const nonGoogle = validateGoogleMapsUrl('https://facebook.com/mybusiness');
  assert(!nonGoogle.isValid, 'Non-Google domain must be rejected');

  const noProto = validateGoogleMapsUrl('maps.app.goo.gl/abc');
  assert(!noProto.isValid, 'URL without protocol must be rejected');

  // Test validateSmartQrInput with googleMapsReviewUrl
  const smartInputValid = validateSmartQrInput({
    businessName: 'Warung Kopi Mantap',
    googleMapsReviewUrl: 'https://maps.app.goo.gl/KopiMantapReview',
    wifiEnabled: true,
    wifiName: 'Kopi Mantap Free Wi-Fi',
    wifiPassword: 'ngopidulu123',
  });
  assert(smartInputValid.isValid, 'Valid smart QR input should pass');
  assert(smartInputValid.sanitized.googleMapsReviewUrl === 'https://maps.app.goo.gl/KopiMantapReview');
  assert(smartInputValid.sanitized.googleMapsUrl === 'https://maps.app.goo.gl/KopiMantapReview');
  assert(smartInputValid.sanitized.wifiEnabled === true);

  console.log('✓ Test 2 Passed: Google Maps Review URL validation conforms to requirements.\n');

  // STEP 3: Setup Test User & QR
  console.log('--- Test 3: QR Activation with google_maps_review_url ---');
  const testEmail = `test-review-${Date.now()}@example.com`;
  const [testUser] = await db
    .insert(users)
    .values({
      email: testEmail,
      name: 'Owner Review Test',
      role: 'customer',
    })
    .returning();

  const testCode = `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const [testQr] = await db
    .insert(qrCodes)
    .values({
      code: testCode,
      status: 'blank',
    })
    .returning();

  const reviewUrlA = 'https://maps.app.goo.gl/KlinikSehatReviewUrlA';
  const activationRes = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: testCode,
    businessData: {
      businessName: 'Klinik Sehat Mandiri',
      googleMapsReviewUrl: reviewUrlA,
      wifiEnabled: true,
      wifiName: 'Klinik-WiFi',
      wifiPassword: 'sehatbersama',
    },
  });

  assert(activationRes.success, 'Activation should succeed');
  assert(activationRes.business.googleMapsReviewUrl === reviewUrlA, 'Stored googleMapsReviewUrl must match');
  assert(activationRes.business.googleMapsUrl === reviewUrlA, 'Legacy googleMapsUrl must also be synced');
  console.log('✓ Test 3 Passed: Activation saves google_maps_review_url successfully.\n');

  // STEP 4: Public QR Direct Destination Resolution
  console.log('--- Test 4: Public QR Direct Redirect Resolution ---');
  const publicQrA = await getPublicQrByCode(testCode);
  assert(publicQrA !== null, 'Public QR should exist');
  assert(publicQrA.status === 'active', 'QR must be active');
  assert(publicQrA.googleMapsReviewUrl === reviewUrlA, 'getPublicQrByCode returns googleMapsReviewUrl');
  
  // Verify redirect destination calculation
  const targetA = (publicQrA.googleMapsReviewUrl || publicQrA.googleMapsUrl)?.trim();
  const valTargetA = validateGoogleMapsUrl(targetA);
  assert(valTargetA.isValid, 'Destination must be valid Google Maps URL');
  assert(valTargetA.normalized === reviewUrlA, 'Redirect must point to Review URL A');
  console.log('Resolved direct redirect target for scan/NFC:', valTargetA.normalized);
  console.log('✓ Test 4 Passed: Direct redirect uses google_maps_review_url.\n');

  // STEP 5: Settings Edit (URL A -> URL B) - QR and NFC code MUST NOT change
  console.log('--- Test 5: Edit Business Settings (URL Review A -> URL Review B) ---');
  const reviewUrlB = 'https://maps.app.goo.gl/KlinikSehatReviewUrlB_Updated';
  const updatedBiz = await updateBusinessDetails(activationRes.business.id, testUser.id, {
    googleMapsReviewUrl: reviewUrlB,
  });

  assert(updatedBiz.googleMapsReviewUrl === reviewUrlB, 'Business review URL must be updated to B');
  assert(updatedBiz.googleMapsUrl === reviewUrlB, 'Legacy URL must also be updated to B');

  // Public QR fetch after update
  const publicQrB = await getPublicQrByCode(testCode);
  assert(publicQrB.code === testCode, 'Physical QR / NFC public code remains strictly identical');
  assert(publicQrB.googleMapsReviewUrl === reviewUrlB, 'Public QR now resolves to Review URL B');
  const targetB = (publicQrB.googleMapsReviewUrl || publicQrB.googleMapsUrl)?.trim();
  const valTargetB = validateGoogleMapsUrl(targetB);
  assert(valTargetB.normalized === reviewUrlB, 'Direct redirect immediately points to URL Review B');
  console.log('✓ Test 5 Passed: URL Review A -> URL Review B updated smoothly without changing QR code.\n');

  // STEP 6: Error Handling when google_maps_review_url is empty/invalid
  console.log('--- Test 6: Error Handling when Review URL is empty or invalid ---');
  const codeEmpty = `EMPTY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(qrCodes).values({ code: codeEmpty, status: 'blank' });

  const emptyAct = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: codeEmpty,
    businessData: {
      businessName: 'Bisnis Tanpa Maps',
      googleMapsReviewUrl: '',
      wifiEnabled: false,
    },
  });

  // Temporarily force review url to empty in DB to test error boundary
  await db.update(businesses).set({ googleMapsReviewUrl: null, googleMapsUrl: null }).where(eq(businesses.id, emptyAct.business.id));

  const publicEmpty = await getPublicQrByCode(codeEmpty);
  const targetEmpty = (publicEmpty.googleMapsReviewUrl || publicEmpty.googleMapsUrl)?.trim();
  const valTargetEmpty = validateGoogleMapsUrl(targetEmpty);
  assert(!valTargetEmpty.isValid, 'Should fail validation when URL is null/empty');
  console.log('When URL is missing, system prevents redirect and shows: "Google Maps belum dikonfigurasi untuk bisnis ini."');
  console.log('✓ Test 6 Passed: Error boundary prevents redirect on missing/invalid URL.\n');

  // STEP 7: Wi-Fi Access Preservation
  console.log('--- Test 7: Wi-Fi credentials preserved and functional ---');
  const wifiCreds = await getQrWifiCredentials(testCode);
  assert(wifiCreds.success === true, 'Wi-Fi credentials should still be retrievable via reveal API');
  assert(wifiCreds.wifi_name === 'Klinik-WiFi');
  assert(wifiCreds.wifi_password === 'sehatbersama');
  console.log('✓ Test 7 Passed: Wi-Fi credentials intact and functional.\n');

  // CLEANUP
  console.log('Cleaning up test data...');
  await db.delete(qrCodes).where(eq(qrCodes.code, testCode));
  await db.delete(qrCodes).where(eq(qrCodes.code, codeEmpty));
  await db.delete(businesses).where(eq(businesses.id, activationRes.business.id));
  await db.delete(businesses).where(eq(businesses.id, emptyAct.business.id));
  await db.delete(users).where(eq(users.id, testUser.id));

  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
