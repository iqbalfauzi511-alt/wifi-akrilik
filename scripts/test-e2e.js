import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes, scanLogs } from '../lib/db/schema.js';
import { getQrByCode, getAllQrsAdmin, updateQrStatus, recordScanLog } from '../lib/db/queries/qr.js';
import { activateQrTransaction, updateBusinessDetails, getBusinessByOwnerId } from '../lib/db/queries/business.js';
import { getAdminStats, getCustomerStats } from '../lib/db/queries/stats.js';
import { generateBatchQrCodes } from '../lib/utils/code-generator.js';
import { bulkInsertQrs } from '../lib/db/queries/qr.js';
import { eq } from 'drizzle-orm';

async function runEndToEndTests() {
  console.log('🧪 Starting End-to-End Verification Tests...\n');
  await ensureDatabaseInitialized();
  const db = getDb();

  // Test 1: Verify users and seeded data
  console.log('1️⃣ Test Seeded Data:');
  const adminUser = await db.query.users.findFirst({ where: eq(users.email, 'admin@smartwifi.com') });
  const customerUser = await db.query.users.findFirst({ where: eq(users.email, 'ahmad@kopisenja.com') });
  const business = await getBusinessByOwnerId(customerUser.id);
  console.log(`   - Admin: ${adminUser.email} (Role: ${adminUser.role})`);
  console.log(`   - Customer: ${customerUser.email} (Role: ${customerUser.role})`);
  console.log(`   - Business: ${business.businessName}, SSID: ${business.wifiName}, PWD: ${business.wifiPassword}`);

  if (!adminUser || !customerUser || !business) {
    throw new Error('Test 1 failed: seed data incomplete');
  }
  console.log('   ✅ PASS\n');

  // Test 2: Visitor scans unactivated QR
  console.log('2️⃣ Test Visitor Scanning Unactivated QR (SW-BLANK1):');
  const blankQr = await getQrByCode('SW-BLANK1');
  console.log(`   - Code: ${blankQr.code}, Status: ${blankQr.status}, BusinessId: ${blankQr.businessId}`);
  if (blankQr.status !== 'blank' || blankQr.businessId !== null) {
    throw new Error('Test 2 failed: SW-BLANK1 should be blank and unassigned');
  }
  console.log('   ✅ PASS: QR correctly identified as unactivated\n');

  // Test 3: Customer activates SW-BLANK1
  console.log('3️⃣ Test Customer Activating QR (SW-BLANK1):');
  const activationResult = await activateQrTransaction({
    userId: customerUser.id,
    qrCodeValue: 'SW-BLANK1',
    businessData: {
      businessName: 'Kopi Senja Meja 2',
      instagramUsername: 'kopisenja',
      wifiName: 'KOPI SENJA',
      wifiPassword: 'kopisenja123',
    },
  });

  console.log(`   - Activation Success: ${activationResult.success}`);
  const activatedQr = await getQrByCode('SW-BLANK1');
  console.log(`   - New Status: ${activatedQr.status}, Business: ${activatedQr.businessName}`);
  if (!activationResult.success || activatedQr.status !== 'active') {
    throw new Error('Test 3 failed: QR activation failed');
  }
  console.log('   ✅ PASS: QR status successfully transitioned to ACTIVE\n');

  // Test 4: Customer updates Wi-Fi password
  console.log('4️⃣ Test Customer Updating Wi-Fi Password:');
  const newPassword = 'kopisenja_newpassword_2026';
  const updatedBiz = await updateBusinessDetails(business.id, customerUser.id, {
    wifiPassword: newPassword,
  });
  console.log(`   - Updated Password in DB: ${updatedBiz.wifiPassword}`);

  // Visitor re-scans both QRs and verifies new password is immediately reflected
  const recheckQr1 = await getQrByCode('SW-KOP001');
  const recheckQr2 = await getQrByCode('SW-BLANK1');
  console.log(`   - Visitor scan SW-KOP001 reveals: ${recheckQr1.wifiPassword}`);
  console.log(`   - Visitor scan SW-BLANK1 reveals: ${recheckQr2.wifiPassword}`);

  if (recheckQr1.wifiPassword !== newPassword || recheckQr2.wifiPassword !== newPassword) {
    throw new Error('Test 4 failed: updated Wi-Fi password was not served');
  }
  console.log('   ✅ PASS: All QRs automatically serve the new Wi-Fi password without reprinting!\n');

  // Test 5: Visitor Scan Logging
  console.log('5️⃣ Test Visitor Scan Logging:');
  const preStats = await getCustomerStats(business.id);
  console.log(`   - Scans before: ${preStats.totalScans}`);
  await recordScanLog(recheckQr1.id, 'Mozilla/5.0 (iPhone Test Agent)');
  await recordScanLog(recheckQr2.id, 'Mozilla/5.0 (Android Test Agent)');
  const postStats = await getCustomerStats(business.id);
  console.log(`   - Scans after: ${postStats.totalScans}`);
  if (postStats.totalScans !== preStats.totalScans + 2) {
    throw new Error('Test 5 failed: scan log counter did not increment');
  }
  console.log('   ✅ PASS: Scan logs accurately recorded and aggregated\n');

  // Test 6: Admin Mass QR Generation
  console.log('6️⃣ Test Admin Mass QR Generation:');
  const generatedCodes = generateBatchQrCodes(10);
  console.log(`   - Generated ${generatedCodes.length} secure unique codes: ${generatedCodes.slice(0, 3).join(', ')}...`);
  const insertedBatch = await bulkInsertQrs(generatedCodes);
  console.log(`   - Inserted batch count: ${insertedBatch.length}`);
  if (insertedBatch.length !== 10 || insertedBatch[0].status !== 'blank') {
    throw new Error('Test 6 failed: mass QR generation failed');
  }
  console.log('   ✅ PASS: Mass generation completed with status BLANK\n');

  // Test 7: Admin QR Status Management
  console.log('7️⃣ Test Admin QR Status Management:');
  const testQr = insertedBatch[0];
  const soldQr = await updateQrStatus(testQr.id, 'sold');
  console.log(`   - Changed status: ${testQr.code} from blank -> ${soldQr.status} (soldAt: ${soldQr.soldAt})`);
  if (soldQr.status !== 'sold' || !soldQr.soldAt) {
    throw new Error('Test 7 failed: status update failed');
  }
  console.log('   ✅ PASS: Admin status management verified\n');

  // Test 8: Admin Global Analytics
  console.log('8️⃣ Test Admin Global Analytics:');
  const adminStats = await getAdminStats();
  console.log(`   - Total QR: ${adminStats.totalQr}`);
  console.log(`   - Available (Blank): ${adminStats.availableQr}`);
  console.log(`   - Sold QR: ${adminStats.soldQr}`);
  console.log(`   - Active QR: ${adminStats.activeQr}`);
  console.log(`   - Total Businesses: ${adminStats.totalBusinesses}`);
  console.log(`   - Total Scans: ${adminStats.totalScans}`);
  if (adminStats.totalQr < 10 || adminStats.activeQr < 2) {
    throw new Error('Test 8 failed: admin stats mismatch');
  }
  console.log('   ✅ PASS: Admin analytics correctly computed across all entities\n');

  console.log('🎉 ALL 8 END-TO-END FLOW TESTS PASSED FLAWLESSLY!');
  process.exit(0);
}

runEndToEndTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
