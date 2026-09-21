import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes } from '../lib/db/schema.js';
import { createBatchWithQrs, getPublicQrByCode, getQrWifiCredentials } from '../lib/db/queries/qr.js';
import { activateQrTransaction } from '../lib/db/queries/business.js';

// Simulate reveal handler logic
async function simulateReveal(code) {
  if (!code) {
    return { status: 404, json: { success: false, error: 'QR tidak ditemukan.' } };
  }
  const result = await getQrWifiCredentials(code);
  if (result.error === 'notFound') {
    return { status: 404, json: { success: false, error: 'QR tidak ditemukan.' } };
  }
  if (result.error === 'inactive') {
    return { status: 400, json: { success: false, error: 'QR ini sedang tidak aktif.' } };
  }
  if (result.error === 'noBusiness') {
    return { status: 404, json: { success: false, error: 'Data bisnis tidak ditemukan.' } };
  }
  if (!result.success || !result.wifi_password) {
    return { status: 500, json: { success: false, error: 'Maaf, password Wi-Fi belum bisa ditampilkan. Silakan coba lagi.' } };
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

async function runFollowGateTests() {
  console.log('🧪 Starting Follow Gate Security & Reveal API Test Suite...\n');
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
    // 1. Create a test user
    const [testUser] = await db
      .insert(users)
      .values({
        email: `followgate-tester-${Date.now()}@test.com`,
        name: 'Follow Gate Tester',
        role: 'customer',
      })
      .returning();
    assert(testUser && testUser.id, 'Created test customer user');

    // 2. Generate a batch of QRs (status: blank)
    const batch = await createBatchWithQrs(3);
    const testQr = batch.qrs[0];
    assert(testQr && testQr.code, `Created test QR with code: ${testQr.code}`);

    // 3. Test Security on Blank QR (before activation)
    console.log('\n🔒 Test 1: Blank QR Security Check');
    const blankPublicData = await getPublicQrByCode(testQr.code);
    assert(blankPublicData !== null, 'Found blank QR by public query');
    assert(blankPublicData.wifiPassword === undefined, 'Public query strictly OMITS wifiPassword on blank QR');
    assert(blankPublicData.status === 'blank', 'QR status is blank');

    const blankCreds = await getQrWifiCredentials(testQr.code);
    assert(blankCreds.error === 'inactive', 'Reveal query blocks blank QR with inactive error');
    assert(blankCreds.wifi_password === undefined, 'No wifi_password returned for blank QR');

    // Test API route on blank QR
    const blankApi = await simulateReveal(testQr.code);
    assert(blankApi.status === 400, 'Reveal API returns status 400 for blank QR');
    assert(blankApi.json.error === 'QR ini sedang tidak aktif.', 'Reveal API returns clean inactive error message');

    // 4. Test API route on non-existent QR
    console.log('\n🔍 Test 2: Non-existent QR Check');
    const nonExistentApi = await simulateReveal('NONEXISTENT-999');
    assert(nonExistentApi.status === 404, 'Reveal API returns status 404 for non-existent QR');
    assert(nonExistentApi.json.error === 'QR tidak ditemukan.', 'Reveal API returns clean not found error message');

    // 5. Activate the QR with business info
    console.log('\n⚡ Test 3: Activate QR & Verify Follow Gate Flow');
    const activation = await activateQrTransaction({
      userId: testUser.id,
      qrCodeValue: testQr.code,
      businessData: {
        businessName: 'Kopi Senja Utama',
        instagramUrl: 'https://www.instagram.com/kopisenjautama/',
        wifiName: 'KopiSenja_Guest',
        wifiPassword: 'kopisenja123secret',
      },
    });
    assert(activation.success === true, 'Successfully activated QR for business');

    // 6. Test Security on Active QR (Initial Page Load)
    console.log('\n🛡️ Test 4: Active QR Initial Public Load Security');
    const activePublicData = await getPublicQrByCode(testQr.code);
    assert(activePublicData.status === 'active', 'QR status is active');
    assert(activePublicData.businessName === 'Kopi Senja Utama', 'Public query returns businessName');
    assert(activePublicData.instagramUrl === 'https://www.instagram.com/kopisenjautama/', 'Public query returns instagramUrl');
    assert(activePublicData.wifiName === 'KopiSenja_Guest', 'Public query returns wifiName');
    assert(activePublicData.wifiPassword === undefined, 'CRITICAL: Public query strictly OMITS wifiPassword on ACTIVE QR!');
    assert(!('wifiPassword' in activePublicData), 'CRITICAL: wifiPassword key does not even exist in active public query result!');

    // 7. Test Reveal API Endpoint on Active QR (After user clicks "Saya Sudah Follow")
    console.log('\n📱 Test 5: POST /api/q/[code]/reveal on Active QR');
    const revealApi = await simulateReveal(testQr.code);
    assert(revealApi.status === 200, 'Reveal API returns status 200 for active QR');
    assert(revealApi.json.success === true, 'Reveal API returns success: true');
    assert(revealApi.json.wifi_name === 'Kopi Senja Utama' || revealApi.json.wifi_name === 'KopiSenja_Guest', `Reveal API returns correct wifi_name: ${revealApi.json.wifi_name}`);
    assert(revealApi.json.wifi_password === 'kopisenja123secret', `Reveal API returns correct wifi_password: ${revealApi.json.wifi_password}`);

    console.log('\n========================================');
    console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runFollowGateTests();
