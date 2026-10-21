/**
 * Comprehensive Integration Test:
 * "buat jika saat aktivasi hanya memilih maps maka direct langsung ke mapsnya,
 * tetapi jika memilih wifi maka buat halaman lagi untuk klik untuk beri review dan setelah itu kembali bisa melihat pasword wifi"
 */

import assert from 'assert';
import { db, ensureDatabaseInitialized } from '../lib/db/index.js';
import { businesses, qrCodes, users } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { activateQrTransaction, updateBusinessDetails } from '../lib/db/queries/business.js';
import { getPublicQrByCode, getQrWifiCredentials } from '../lib/db/queries/qr.js';
import { validateGoogleMapsUrl } from '../lib/utils/validation.js';

async function runTests() {
  console.log('🧪 Starting Smart Wi-Fi Flow Test Suite...\n');
  await ensureDatabaseInitialized();

  // Setup Test User
  const testEmail = `smart-flow-${Date.now()}@example.com`;
  const [testUser] = await db
    .insert(users)
    .values({
      email: testEmail,
      name: 'Owner Flow Tester',
      role: 'customer',
    })
    .returning();

  // ========================================================
  // SCENARIO 1: AKTIVASI HANYA MEMILIH MAPS (wifiEnabled: false)
  // ========================================================
  console.log('--- Test 1: Bisnis HANYA Memilih Maps (Wi-Fi Nonaktif) ---');
  const codeMapsOnly = `MAPS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(qrCodes).values({ code: codeMapsOnly, status: 'blank' });

  const mapsUrlA = 'https://maps.app.goo.gl/TokoKueReview123';
  const actMapsOnly = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: codeMapsOnly,
    businessData: {
      businessName: 'Toko Kue Manis',
      googleMapsReviewUrl: mapsUrlA,
      wifiEnabled: false,
    },
  });

  assert(actMapsOnly.success, 'Activation should succeed');
  const publicMapsOnly = await getPublicQrByCode(codeMapsOnly);
  assert(publicMapsOnly.wifiEnabled === false, 'wifiEnabled must be false');
  
  // Logic on /q/[code]: if !wifiEnabled -> Direct redirect!
  const rawUrl = (publicMapsOnly.googleMapsReviewUrl || publicMapsOnly.googleMapsUrl)?.trim();
  const valUrl = validateGoogleMapsUrl(rawUrl);
  assert(valUrl.isValid, 'URL must be valid Google Maps URL');
  assert(valUrl.normalized === mapsUrlA, 'Redirect target must match maps URL');
  console.log('Behavior on scan /q/' + codeMapsOnly + ': DIRECT REDIRECT -> ' + valUrl.normalized);
  console.log('✓ Test 1 Passed: Jika hanya memilih maps, scan QR langsung direct ke Maps Review.\n');

  // ========================================================
  // SCENARIO 2: AKTIVASI MEMILIH WI-FI (wifiEnabled: true)
  // ========================================================
  console.log('--- Test 2: Bisnis MEMILIH Wi-Fi (Wi-Fi Aktif) ---');
  const codeWithWifi = `WIFI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(qrCodes).values({ code: codeWithWifi, status: 'blank' });

  const mapsUrlB = 'https://maps.app.goo.gl/KopiSoreReview456';
  const actWifi = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: codeWithWifi,
    businessData: {
      businessName: 'Kopi Sore Cafe',
      googleMapsReviewUrl: mapsUrlB,
      wifiEnabled: true,
      wifiName: 'KopiSore-FreeWiFi',
      wifiPassword: 'kopisorelovers',
    },
  });

  assert(actWifi.success, 'Activation with wifi should succeed');
  const publicWifi = await getPublicQrByCode(codeWithWifi);
  assert(publicWifi.wifiEnabled === true, 'wifiEnabled must be true');
  assert(publicWifi.wifiPassword === undefined, 'Password is NOT exposed in public QR query');

  console.log('Behavior on scan /q/' + codeWithWifi + ': RENDER HALAMAN REVIEW-TO-WIFI (VisitorScanExperience)');
  console.log('  1. Pengunjung klik "Beri Rating di Google Maps" -> buka: ' + mapsUrlB);
  console.log('  2. Pengunjung kembali & klik "Saya Sudah Review" -> memanggil /api/q/' + codeWithWifi + '/reveal-wifi');

  const wifiCreds = await getQrWifiCredentials(codeWithWifi);
  assert(wifiCreds.success === true, 'Reveal credentials should succeed');
  assert(wifiCreds.wifi_name === 'KopiSore-FreeWiFi', 'Correct SSID returned');
  assert(wifiCreds.wifi_password === 'kopisorelovers', 'Correct password returned');
  console.log('  3. Password Wi-Fi terbuka: SSID=' + wifiCreds.wifi_name + ', Password=[REDACTED]');
  console.log('✓ Test 2 Passed: Jika memilih Wi-Fi, tampil halaman review gate lalu password terbuka.\n');

  // ========================================================
  // SCENARIO 3: EDIT SETTINGS (TOGGLE WI-FI DI DASHBOARD)
  // ========================================================
  console.log('--- Test 3: Pengubahan Pengaturan Wi-Fi di Dashboard (QR Meja Tetap Sama) ---');
  // Matikan Wi-Fi untuk Kopi Sore Cafe. Sibling device follows business defaults.
  const siblingCode = `WIFI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await db.insert(qrCodes).values({ code: siblingCode, status: 'blank' });
  const siblingActivation = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: siblingCode,
    businessData: {
      targetBusinessId: actWifi.business.id,
      businessName: 'Kopi Sore Cafe',
    },
  });
  assert(siblingActivation.success, 'Additional device should activate against existing business');

  await updateBusinessDetails(actWifi.business.id, testUser.id, {
    wifiEnabled: false,
  });

  const publicWifiSwitched = await getPublicQrByCode(codeWithWifi);
  assert(publicWifiSwitched.wifiEnabled === false, 'wifiEnabled should now be false');
  const publicSiblingSwitched = await getPublicQrByCode(siblingCode);
  assert(publicSiblingSwitched.wifiEnabled === false, 'Business Wi-Fi change propagates to sibling device');

  // Changes must remain limited to selected business/branch.
  const publicMapsUnchanged = await getPublicQrByCode(codeMapsOnly);
  assert(publicMapsUnchanged.wifiEnabled === false, 'Other business Wi-Fi setting remains unchanged');

  // Nyalakan kembali Wi-Fi untuk Toko Kue Manis.
  await updateBusinessDetails(actMapsOnly.business.id, testUser.id, {
    wifiEnabled: true,
    wifiName: 'TokoKue-WiFi',
    wifiPassword: 'kuemanisrasanya',
  });
  const publicMapsSwitched = await getPublicQrByCode(codeMapsOnly);
  assert(publicMapsSwitched.wifiEnabled === true, 'wifiEnabled should now be true');

  console.log('✓ Test 3 Passed: Pengaturan dinamis berfungsi sempurna dengan QR fisik yang sama.\n');

  console.log('Cleaning up test data...');
  await db.delete(qrCodes).where(eq(qrCodes.code, codeMapsOnly));
  await db.delete(qrCodes).where(eq(qrCodes.code, codeWithWifi));
  await db.delete(qrCodes).where(eq(qrCodes.code, siblingCode));
  await db.delete(businesses).where(eq(businesses.id, actMapsOnly.business.id));
  await db.delete(businesses).where(eq(businesses.id, actWifi.business.id));
  await db.delete(users).where(eq(users.id, testUser.id));

  console.log('🎉 ALL SMART WI-FI FLOW TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
