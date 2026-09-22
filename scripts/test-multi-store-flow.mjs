import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { qrCodes, businesses, users } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import {
  getBusinessesByOwnerId,
  createBusinessBranch,
  updateBusinessDetails,
  activateQrTransaction,
} from '../lib/db/queries/business.js';
import {
  getQrByCode,
  getQrWifiCredentials,
  getQrsByOwnerUserId,
} from '../lib/db/queries/qr.js';

async function runMultiStoreTests() {
  console.log('🏬 Starting Cobascan Multi-Store / Multi-Branch Test Suite...\n');
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

  let testUser = null;
  let storeA = null;
  let storeB = null;
  let qrA = null;
  let qrB = null;

  try {
    // 1. Create a customer user with 1 email
    const [user] = await db
      .insert(users)
      .values({
        email: `multi-owner-${Date.now()}@example.com`,
        name: 'Multi Outlet Owner',
        role: 'customer',
      })
      .returning();
    testUser = user;
    assert(testUser && testUser.id, `Created test user: ${testUser.email}`);

    // 2. Create blank QR A and blank QR B
    const codeA = `TEST-A-${Date.now().toString().slice(-4)}`;
    const codeB = `TEST-B-${Date.now().toString().slice(-4)}`;

    const [q1] = await db.insert(qrCodes).values({ code: codeA, status: 'blank' }).returning();
    const [q2] = await db.insert(qrCodes).values({ code: codeB, status: 'blank' }).returning();
    qrA = q1;
    qrB = q2;
    assert(qrA && qrB, `Created 2 blank hardware units: ${codeA} and ${codeB}`);

    // 3. Activate QR A as Toko A (Senopati branch)
    console.log('\n📍 Step 1: Activating Device A for Toko A (Senopati)...');
    const actResultA = await activateQrTransaction({
      userId: testUser.id,
      qrCodeValue: codeA,
      businessData: {
        businessName: 'Kopi Kenangan - Senopati',
        googleMapsReviewUrl: 'https://maps.app.goo.gl/senopati-review',
        wifiEnabled: true,
        wifiName: 'Wifi-Senopati-Free',
        wifiPassword: 'password-senopati-123',
      },
    });
    assert(actResultA.success, 'Successfully activated QR A for Toko A');
    storeA = actResultA.business;
    assert(storeA.businessName === 'Kopi Kenangan - Senopati', 'Store A name correctly set');
    assert(storeA.wifiPassword === 'password-senopati-123', 'Store A Wi-Fi password set');

    // 4. Activate QR B for Toko B (Kemang branch) using same email user, as a NEW branch!
    console.log('\n📍 Step 2: Activating Device B for Toko B (Kemang) under the SAME owner...');
    const actResultB = await activateQrTransaction({
      userId: testUser.id,
      qrCodeValue: codeB,
      businessData: {
        isNewBusiness: true, // Brand new branch!
        businessName: 'Kopi Kenangan - Kemang',
        googleMapsReviewUrl: 'https://maps.app.goo.gl/kemang-review',
        wifiEnabled: true,
        wifiName: 'Wifi-Kemang-Guests',
        wifiPassword: 'password-kemang-456',
      },
    });
    assert(actResultB.success, 'Successfully activated QR B for Toko B without overwriting Toko A');
    storeB = actResultB.business;
    assert(storeB.id !== storeA.id, `Store B has distinct ID (${storeB.id}) from Store A (${storeA.id})`);
    assert(storeB.businessName === 'Kopi Kenangan - Kemang', 'Store B name correctly set');
    assert(storeB.wifiPassword === 'password-kemang-456', 'Store B has its own distinct Wi-Fi password');

    // 5. Query all businesses owned by this owner
    console.log('\n📍 Step 3: Verifying Multi-Store Query for Owner...');
    const ownerStores = await getBusinessesByOwnerId(testUser.id);
    assert(ownerStores.length === 2, `Owner has exactly 2 branches (found: ${ownerStores.length})`);
    const storeNames = ownerStores.map((s) => s.businessName);
    assert(storeNames.includes('Kopi Kenangan - Senopati'), 'Found Senopati branch in owner stores');
    assert(storeNames.includes('Kopi Kenangan - Kemang'), 'Found Kemang branch in owner stores');

    // 6. Test independent settings modification:
    // Update Store A Wi-Fi and review URL
    console.log('\n📍 Step 4: Testing Independent Credential Updates (Toko A vs Toko B)...');
    const updateResultA = await updateBusinessDetails(storeA.id, testUser.id, {
      businessName: 'Kopi Kenangan - Senopati Updated',
      wifiName: 'Wifi-Senopati-5G',
      wifiPassword: 'new-senopati-password-999',
      googleMapsReviewUrl: 'https://maps.app.goo.gl/senopati-new-url',
    });
    assert(updateResultA && updateResultA.businessName.includes('Updated'), 'Toko A updated successfully');

    // Verify Toko B was NOT affected
    const [freshStoreB] = await db.select().from(businesses).where(eq(businesses.id, storeB.id));
    assert(
      freshStoreB.wifiPassword === 'password-kemang-456',
      'Toko B Wi-Fi password remained completely untouched ("password-kemang-456")'
    );
    assert(
      freshStoreB.wifiName === 'Wifi-Kemang-Guests',
      'Toko B Wi-Fi SSID remained completely untouched ("Wifi-Kemang-Guests")'
    );
    assert(
      freshStoreB.googleMapsReviewUrl === 'https://maps.app.goo.gl/kemang-review',
      'Toko B Google Review URL remained completely untouched'
    );

    // 7. Verify QR Public Reveal Wi-Fi Endpoint for each device
    console.log('\n📍 Step 5: Verifying Public QR Wi-Fi Credentials per Device...');
    const credsA = await getQrWifiCredentials(codeA);
    assert(credsA.success === true, 'QR A Wi-Fi credentials successfully fetched');
    assert(credsA.wifi_password === 'new-senopati-password-999', `QR A returned Toko A password: ${credsA.wifi_password}`);

    const credsB = await getQrWifiCredentials(codeB);
    assert(credsB.success === true, 'QR B Wi-Fi credentials successfully fetched');
    assert(credsB.wifi_password === 'password-kemang-456', `QR B returned Toko B password: ${credsB.wifi_password}`);

    // 8. Verify getQrsByOwnerUserId returns both devices with respective store names
    console.log('\n📍 Step 6: Verifying Dashboard QR Query...');
    const ownerQrs = await getQrsByOwnerUserId(testUser.id);
    assert(ownerQrs.length === 2, `Dashboard lists all 2 devices across both branches (found: ${ownerQrs.length})`);
    const foundQrA = ownerQrs.find((q) => q.code === codeA);
    const foundQrB = ownerQrs.find((q) => q.code === codeB);
    assert(foundQrA && foundQrA.businessName.includes('Senopati'), 'Device A is labeled with Senopati branch');
    assert(foundQrB && foundQrB.businessName.includes('Kemang'), 'Device B is labeled with Kemang branch');

    // 9. Test Direct Branch Creation from Dashboard (createBusinessBranch)
    console.log('\n📍 Step 7: Testing Direct Branch Creation (e.g. from Settings "+ Tambah Cabang")...');
    const storeC = await createBusinessBranch(testUser.id, {
      businessName: 'Kopi Kenangan - Bintaro',
      googleMapsReviewUrl: 'https://maps.app.goo.gl/bintaro-review',
      wifiEnabled: false,
    });
    assert(storeC && storeC.businessName === 'Kopi Kenangan - Bintaro', 'Direct branch creation successful');

    const updatedStores = await getBusinessesByOwnerId(testUser.id);
    assert(updatedStores.length === 3, `Owner now has 3 distinct branches (found: ${updatedStores.length})`);

    console.log(`\n==============================================`);
    console.log(`🎉 ALL MULTI-STORE / MULTI-BRANCH TESTS PASSED!`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    console.log(`==============================================\n`);
  } catch (err) {
    console.error('💥 Test suite crashed with error:', err);
    failed++;
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test artifacts...');
    if (qrA) await db.delete(qrCodes).where(eq(qrCodes.id, qrA.id));
    if (qrB) await db.delete(qrCodes).where(eq(qrCodes.id, qrB.id));
    if (testUser) {
      await db.delete(businesses).where(eq(businesses.ownerId, testUser.id));
      await db.delete(users).where(eq(users.id, testUser.id));
    }
    console.log('✓ Cleanup complete.\n');
    process.exit(0);
  }
}

runMultiStoreTests();
