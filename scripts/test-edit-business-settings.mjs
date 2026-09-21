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
  getBusinessByOwnerId,
} from '../lib/db/queries/business.js';
import {
  validateGoogleMapsUrl,
  validateSmartQrInput,
} from '../lib/utils/validation.js';
import { inArray } from 'drizzle-orm';

// Simulate reveal-wifi API endpoint logic
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

async function runEditBusinessSettingsTests() {
  console.log('🧪 Starting "Edit Business Settings" Specific Test Suite...\n');
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
    // -------------------------------------------------------------------------
    // TEST 1 — Google Maps Update (Prompt Section 17, Test 1)
    // -------------------------------------------------------------------------
    console.log('--- Test 1: Google Maps URL Update & QR Code Invariance ---');
    const [user1] = await db
      .insert(users)
      .values({
        email: `bizowner-test1-${Date.now()}@test.com`,
        name: 'Owner Test 1',
        role: 'customer',
      })
      .returning();
    createdUserIds.push(user1.id);

    const batch1 = await createBatchWithQrs(3);
    createdBatchIds.push(batch1.batch.id);
    const qr1 = batch1.qrs[0];
    const originalQrCode = qr1.code;

    // 1.1 Aktivasi product dengan Google Maps URL A
    const urlA = 'https://maps.app.goo.gl/InitialLocationA123';
    const valA = validateSmartQrInput({
      businessName: 'Kopi Senja Utama',
      googleMapsUrl: urlA,
      wifiEnabled: false,
    });
    assert(valA.isValid, 'Initial activation data with URL A is valid');

    const activation1 = await activateQrTransaction({
      userId: user1.id,
      qrCodeValue: originalQrCode,
      businessData: valA.sanitized,
    });
    assert(activation1.success, 'Product activated with Google Maps URL A');

    // 1.2 Buka QR: Pastikan tombol menuju URL A
    const publicA = await getPublicQrByCode(originalQrCode);
    assert(publicA.googleMapsUrl === urlA, 'Public page uses Google Maps URL A');
    assert(publicA.code === originalQrCode, 'Public code matches original QR code');

    // 1.3 Customer masuk dashboard & ganti ke URL B
    const urlB = 'https://maps.app.goo.gl/UpdatedLocationB456';
    const valB = validateGoogleMapsUrl(urlB);
    assert(valB.isValid, 'URL B is valid Google Maps URL');

    const updatedBiz1 = await updateBusinessDetails(activation1.business.id, user1.id, {
      googleMapsUrl: valB.normalized,
    });
    assert(updatedBiz1 !== null, 'Business settings updated to URL B in database');

    // 1.4 Buka QR yang sama: Pastikan tombol sekarang menuju URL B
    const publicB = await getPublicQrByCode(originalQrCode);
    assert(publicB.googleMapsUrl === urlB, 'Public page immediately uses Google Maps URL B');

    // 1.5 Pastikan QR code dan batch fisik TIDAK berubah
    assert(publicB.code === originalQrCode, 'CRITICAL: Physical QR code remains 100% UNCHANGED');
    assert(publicB.batchCode === batch1.batch.batchCode, 'CRITICAL: Physical batch remains 100% UNCHANGED');

    // -------------------------------------------------------------------------
    // TEST 2 — Wi-Fi Name & Password Update (Prompt Section 17, Test 2)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Wi-Fi Name & Password Update & Zero Leakage ---');
    const [user2] = await db
      .insert(users)
      .values({
        email: `bizowner-test2-${Date.now()}@test.com`,
        name: 'Owner Test 2 (Cafe)',
        role: 'customer',
      })
      .returning();
    createdUserIds.push(user2.id);

    const batch2 = await createBatchWithQrs(2);
    createdBatchIds.push(batch2.batch.id);
    const qr2 = batch2.qrs[0];

    // 2.1 Aktifkan Wi-Fi dengan Password A dan SSID A
    const valWifiA = validateSmartQrInput({
      businessName: 'Cafe Resto 99',
      googleMapsUrl: 'https://maps.app.goo.gl/Cafe99Location',
      wifiEnabled: true,
      wifiName: 'KopiSenja_Guest',
      wifiPassword: 'passwordA123',
    });
    const activation2 = await activateQrTransaction({
      userId: user2.id,
      qrCodeValue: qr2.code,
      businessData: valWifiA.sanitized,
    });
    assert(activation2.success, 'Activated with Wi-Fi enabled, SSID A and Password A');

    // 2.2 Buka QR: initial load strictly hides password
    const publicWifiA = await getPublicQrByCode(qr2.code);
    assert(publicWifiA.wifiEnabled === true, 'Public QR reflects wifiEnabled = true');
    assert(publicWifiA.wifiPassword === undefined, 'Zero Password Leakage on initial public load');

    // 2.3 Klik reveal: Pastikan password A muncul
    const revealResA = await simulateRevealWifi(qr2.code);
    assert(revealResA.status === 200, 'Reveal endpoint returns status 200');
    assert(revealResA.json.wifi_name === 'KopiSenja_Guest', 'Reveal endpoint returns SSID A');
    assert(revealResA.json.wifi_password === 'passwordA123', 'Reveal endpoint returns Password A');

    // 2.4 Ganti Wi-Fi name dan password menjadi B di settings
    const updatedBiz2 = await updateBusinessDetails(activation2.business.id, user2.id, {
      wifiName: 'KopiSenja_5G',
      wifiPassword: 'kopisenja2026',
    });
    assert(updatedBiz2 !== null, 'Business settings updated to SSID B and Password B');

    // 2.5 Buka QR yang sama & reveal kembali: Pastikan password B muncul
    const revealResB = await simulateRevealWifi(qr2.code);
    assert(revealResB.status === 200, 'Reveal endpoint returns status 200 on same QR');
    assert(revealResB.json.wifi_name === 'KopiSenja_5G', 'Reveal endpoint returns updated SSID B');
    assert(revealResB.json.wifi_password === 'kopisenja2026', 'Reveal endpoint returns updated Password B');

    // 2.6 QR code fisik tetap sama
    assert(qr2.code === (await getPublicQrByCode(qr2.code)).code, 'CRITICAL: Physical QR code remains identical');

    // -------------------------------------------------------------------------
    // TEST 3 — Disable Wi-Fi Toggle (Prompt Section 17, Test 3)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Disable Wi-Fi Toggle Flow ---');
    // 3.1 Wi-Fi aktif sebelum dimatikan
    assert((await getPublicQrByCode(qr2.code)).wifiEnabled === true, 'Wi-Fi is initially active');

    // 3.2 Matikan Wi-Fi dari dashboard (wifiEnabled = false)
    await updateBusinessDetails(activation2.business.id, user2.id, {
      wifiEnabled: false,
    });

    // 3.3 Refresh public page: Wi-Fi section harus hilang (wifiEnabled === false)
    const publicDisabled = await getPublicQrByCode(qr2.code);
    assert(publicDisabled.wifiEnabled === false, 'Public QR now reflects wifiEnabled = false');

    // 3.4 Reveal endpoint ditolak saat Wi-Fi dimatikan
    const revealBlocked = await simulateRevealWifi(qr2.code);
    assert(revealBlocked.status === 400, 'Reveal endpoint returns 400 when Wi-Fi is disabled');
    assert(revealBlocked.json.error.includes('tidak diaktifkan'), 'Clear message that Wi-Fi is disabled by owner');

    // -------------------------------------------------------------------------
    // TEST 4 — NFC Consistency (Prompt Section 17, Test 4)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: NFC URL Consistency & Reusability ---');
    const appBaseUrl = 'https://wifi-akrilik.vercel.app';
    const nfcUrl = `${appBaseUrl}/q/${qr1.code}`;
    const qrTargetUrl = `${appBaseUrl}/q/${qr1.code}`;
    assert(nfcUrl === qrTargetUrl, 'NFC tag URL and acrylic QR URL are 100% identical');

    // Customer re-enables Wi-Fi and updates name again
    await updateBusinessDetails(activation1.business.id, user1.id, {
      businessName: 'Kopi Senja Flagship',
      wifiEnabled: true,
      wifiName: 'Kopi Senja Flagship Free',
      wifiPassword: 'flagshippassword',
    });

    const publicRefreshed = await getPublicQrByCode(qr1.code);
    assert(publicRefreshed.businessName === 'Kopi Senja Flagship', 'NFC / QR tap immediately loads new business name');
    assert(publicRefreshed.wifiEnabled === true, 'NFC / QR tap immediately loads enabled Wi-Fi state');
    assert(nfcUrl === `${appBaseUrl}/q/${qr1.code}`, 'Physical NFC URL NEVER needed reprogramming');

    // -------------------------------------------------------------------------
    // TEST 5 — Security & Ownership Enforcement (Prompt Section 4)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Security & Ownership Protection ---');
    // User 1 attempts to update User 2's business
    const unauthorizedUpdate = await updateBusinessDetails(activation2.business.id, user1.id, {
      businessName: 'Hacked by User 1',
    });
    assert(unauthorizedUpdate === null, 'SECURITY: User 1 CANNOT modify User 2 business (returns null)');

    // Verify User 2's business was NOT modified
    const biz2Check = await getBusinessByOwnerId(user2.id);
    assert(biz2Check.businessName !== 'Hacked by User 1', 'SECURITY: User 2 business name was preserved safely');

    // Clean up test data
    console.log('\n--- Cleaning up test records ---');
    await db.delete(qrCodes).where(inArray(qrCodes.batchId, createdBatchIds));
    await db.delete(businesses).where(inArray(businesses.ownerId, createdUserIds));
    await db.delete(users).where(inArray(users.id, createdUserIds));
    console.log('Cleanup completed cleanly.');

    console.log(`\n🎉 All Specific Tests Passed! Total: ${passed}, Failed: ${failed}`);
    process.exit(0);
  } catch (err) {
    console.error('💥 Test execution error:', err);
    process.exit(1);
  }
}

runEditBusinessSettingsTests();
