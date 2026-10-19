import assert from 'assert';
import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes } from '../lib/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { activateQrTransaction, updateBusinessDetails } from '../lib/db/queries/business.js';
import { getPublicQrByCode, getQrWifiCredentials, updateQrSettings } from '../lib/db/queries/qr.js';

async function runTests() {
  console.log('🧪 Starting Wi-Fi Voucher & 3-Credential Suite...');
  await ensureDatabaseInitialized();
  const db = getDb();

  const testUserWa = '6289999998811';
  const testCodeStandard = 'TEST-STD-WIFI';
  const testCodeVoucher = 'TEST-VOUCHER-WIFI';

  // Cleanup old test records if any
  await db.delete(qrCodes).where(inArray(qrCodes.code, [testCodeStandard, testCodeVoucher]));
  await db.delete(users).where(eq(users.whatsappNumber, testUserWa));

  const [testUser] = await db
    .insert(users)
    .values({
      name: 'Voucher Test Owner',
      whatsappNumber: testUserWa,
      email: `${testUserWa}@owner.cobascan.local`,
      role: 'customer',
      emailVerified: true,
    })
    .returning();

  // Insert test QRs
  await db.insert(qrCodes).values([
    { code: testCodeStandard, status: 'blank' },
    { code: testCodeVoucher, status: 'blank' },
  ]);

  // Test 1: Standard 2-credential Wi-Fi setup (SSID + Password)
  console.log('\n--- Test 1: Standard Setup (SSID + Password) ---');
  const actStandard = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: testCodeStandard,
    businessData: {
      businessName: 'Cafe Kopi Biasa',
      googleMapsReviewUrl: 'https://maps.app.goo.gl/cafe-biasa',
      wifiEnabled: true,
      wifiName: 'KopiBiasa-Guest',
      wifiPassword: 'kopibiasapassword',
    },
  });
  assert(actStandard.success, 'Activation standard Wi-Fi should succeed');

  const publicStandard = await getPublicQrByCode(testCodeStandard);
  assert(publicStandard.wifiEnabled === true, 'Public QR wifiEnabled should be true');
  assert(publicStandard.wifiPassword === undefined, 'Public QR must NOT expose password');

  const revealStandard = await getQrWifiCredentials(testCodeStandard);
  assert(revealStandard.success === true, 'Reveal should succeed');
  assert(revealStandard.wifi_name === 'KopiBiasa-Guest', 'Correct SSID');
  assert(revealStandard.wifi_username === null, 'wifi_username should be null for standard');
  assert(revealStandard.wifi_password === 'kopibiasapassword', 'Correct password');
  console.log('✓ Test 1 Passed: Standard setup returns SSID + Password and null username.');

  // Test 2: 3-credential Wi-Fi setup (SSID + Voucher Username + Password)
  console.log('\n--- Test 2: Voucher / Hotspot Setup (SSID + Username + Password) ---');
  const actVoucher = await activateQrTransaction({
    userId: testUser.id,
    qrCodeValue: testCodeVoucher,
    businessData: {
      businessName: 'Cafe Hotspot MikroTik',
      googleMapsReviewUrl: 'https://maps.app.goo.gl/cafe-mikrotik',
      wifiEnabled: true,
      wifiName: 'CafeMikroTik@Hotspot',
      wifiUsername: 'tamu-vip-001',
      wifiPassword: 'voucherpass999',
    },
  });
  assert(actVoucher.success, 'Activation voucher Wi-Fi should succeed');

  const publicVoucher = await getPublicQrByCode(testCodeVoucher);
  assert(publicVoucher.wifiEnabled === true, 'Public QR wifiEnabled should be true');
  assert(publicVoucher.wifiPassword === undefined, 'Public QR must NOT expose password');

  const revealVoucher = await getQrWifiCredentials(testCodeVoucher);
  assert(revealVoucher.success === true, 'Reveal should succeed');
  assert(revealVoucher.wifi_name === 'CafeMikroTik@Hotspot', 'Correct SSID');
  assert(revealVoucher.wifi_username === 'tamu-vip-001', 'wifi_username returned correctly');
  assert(revealVoucher.wifi_password === 'voucherpass999', 'Correct password');
  console.log('✓ Test 2 Passed: Voucher setup returns SSID + Username + Password.');

  // Test 3: Device-Level Override for Wi-Fi Username
  console.log('\n--- Test 3: Device-Level Override for Wi-Fi Username ---');
  await updateQrSettings(actVoucher.qr.id, testUser.id, {
    deviceName: 'Meja 5 Outdoor',
    googleMapsReviewUrl: null,
    googleMapsUrl: null,
    wifiEnabled: true,
    wifiName: 'CafeMikroTik-Outdoor',
    wifiUsername: 'meja-05-voucher',
    wifiPassword: 'outdoorpass123',
  });

  const revealDeviceOverride = await getQrWifiCredentials(testCodeVoucher);
  assert(revealDeviceOverride.success === true);
  assert(revealDeviceOverride.wifi_name === 'CafeMikroTik-Outdoor', 'Overridden SSID');
  assert(revealDeviceOverride.wifi_username === 'meja-05-voucher', 'Overridden voucher username');
  assert(revealDeviceOverride.wifi_password === 'outdoorpass123', 'Overridden password');
  console.log('✓ Test 3 Passed: Device-level voucher username override works correctly.');

  // Cleanup
  console.log('\nCleaning up test data...');
  await db.delete(qrCodes).where(inArray(qrCodes.code, [testCodeStandard, testCodeVoucher]));
  await db.delete(businesses).where(inArray(businesses.id, [actStandard.business.id, actVoucher.business.id]));
  await db.delete(users).where(eq(users.id, testUser.id));

  console.log('🎉 ALL VOUCHER & 3-CREDENTIAL TESTS PASSED! 🚀');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});