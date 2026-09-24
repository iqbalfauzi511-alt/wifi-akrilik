import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes, scanLogs, customerFeedback } from '../lib/db/schema.js';
import { eq, like, inArray } from 'drizzle-orm';

async function tidyDatabase() {
  console.log('🔄 Tidying database data...');
  await ensureDatabaseInitialized();
  const db = getDb();

  // 1. Remove only temporary test users (*@test.com)
  const testUsers = await db.select().from(users).where(like(users.email, '%@test.com'));
  console.log(`Found ${testUsers.length} test script users.`);
  if (testUsers.length > 0) {
    const testUserIds = testUsers.map(u => u.id);
    // Associated businesses will cascade delete via foreign key
    await db.delete(users).where(inArray(users.id, testUserIds));
    console.log('✅ Removed test script users and duplicate test businesses.');
  }

  // 2. Ensure admin accounts have password hash and email verified
  const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
  for (const admin of adminUsers) {
    await db.update(users).set({
      emailVerified: true,
      updatedAt: new Date(),
    }).where(eq(users.id, admin.id));
  }

  // 3. Ensure ahmad@kopisenja.com is verified
  const [ahmad] = await db.select().from(users).where(eq(users.email, 'ahmad@kopisenja.com'));
  if (ahmad) {
    await db.update(users).set({
      emailVerified: true,
      updatedAt: new Date(),
    }).where(eq(users.id, ahmad.id));
  }

  // 4. Ensure iqbalfauzi511@gmail.com is verified
  let [iqbal] = await db.select().from(users).where(eq(users.email, 'iqbalfauzi511@gmail.com'));
  if (!iqbal) {
    [iqbal] = await db.insert(users).values({
      email: 'iqbalfauzi511@gmail.com',
      name: 'Iqbal Fauzi',
      role: 'customer',
      emailVerified: true,
    }).returning();
  } else {
    await db.update(users).set({
      emailVerified: true,
      updatedAt: new Date(),
    }).where(eq(users.id, iqbal.id));
  }

  // 5. Ensure Kopi Senja has complete business fields including whatsappNumber
  const targetOwnerId = iqbal ? iqbal.id : ahmad?.id;
  let [biz] = await db.select().from(businesses).where(eq(businesses.ownerId, targetOwnerId));
  if (!biz) {
    [biz] = await db.insert(businesses).values({
      ownerId: targetOwnerId,
      businessName: 'Kopi Senja',
      googleMapsReviewUrl: 'https://maps.app.goo.gl/kopisenja',
      googleMapsUrl: 'https://maps.app.goo.gl/kopisenja',
      wifiEnabled: true,
      wifiName: 'KopiSenja_Guest',
      wifiPassword: 'kopisenja2026',
      whatsappNumber: '6281234567890',
      instagramUrl: 'https://instagram.com/kopisenja',
    }).returning();
    console.log('✅ Created business for primary owner:', biz.businessName);
  } else {
    [biz] = await db.update(businesses).set({
      businessName: 'Kopi Senja',
      googleMapsReviewUrl: 'https://maps.app.goo.gl/kopisenja',
      googleMapsUrl: 'https://maps.app.goo.gl/kopisenja',
      wifiEnabled: true,
      wifiName: 'KopiSenja_Guest',
      wifiPassword: 'kopisenja2026',
      whatsappNumber: '6281234567890',
      instagramUrl: 'https://instagram.com/kopisenja',
      updatedAt: new Date(),
    }).where(eq(businesses.id, biz.id)).returning();
    console.log('✅ Updated Kopi Senja with WhatsApp and Wi-Fi fields.');
  }

  // Also ensure ahmad has a business if different
  if (ahmad && ahmad.id !== targetOwnerId) {
    let [ahmadBiz] = await db.select().from(businesses).where(eq(businesses.ownerId, ahmad.id));
    if (!ahmadBiz) {
      await db.insert(businesses).values({
        ownerId: ahmad.id,
        businessName: 'Kopi Senja',
        googleMapsReviewUrl: 'https://maps.app.goo.gl/kopisenja',
        googleMapsUrl: 'https://maps.app.goo.gl/kopisenja',
        wifiEnabled: true,
        wifiName: 'KopiSenja_Guest',
        wifiPassword: 'kopisenja2026',
        whatsappNumber: '6281234567890',
        instagramUrl: 'https://instagram.com/kopisenja',
      });
    }
  }

  // 6. Ensure active devices for this business
  const activeCodes = ['CSN-0721', 'CSN-0854', 'CSN-0910'];
  for (const code of activeCodes) {
    const existing = await db.select().from(qrCodes).where(eq(qrCodes.code, code));
    if (existing.length === 0) {
      await db.insert(qrCodes).values({
        code,
        status: 'active',
        businessId: biz.id,
        activatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      });
    } else {
      await db.update(qrCodes).set({
        status: 'active',
        businessId: biz.id,
      }).where(eq(qrCodes.code, code));
    }
  }

  // Also keep SW-KOP001 linked
  await db.update(qrCodes).set({
    businessId: biz.id,
    status: 'active',
  }).where(eq(qrCodes.code, 'SW-KOP001'));

  // 7. Seed realistic scan logs across the past 30 days for Kopi Senja devices
  const myQrs = await db.select().from(qrCodes).where(eq(qrCodes.businessId, biz.id));
  const currentScans = await db.select().from(scanLogs);
  if (currentScans.length < 20 && myQrs.length > 0) {
    console.log('Seeding realistic scan activity logs...');
    const now = Date.now();
    const scanEntries = [];

    // Distribute scans over 30 days
    for (let day = 0; day < 30; day++) {
      // 10 to 45 scans per day
      const countToday = Math.floor(12 + Math.sin(day) * 8 + (day % 7 === 0 || day % 7 === 6 ? 15 : 5));
      for (let s = 0; s < countToday; s++) {
        const qr = myQrs[s % myQrs.length];
        const scannedAt = new Date(now - day * 24 * 60 * 60 * 1000 - Math.random() * 20 * 60 * 60 * 1000);
        scanEntries.push({
          qrId: qr.id,
          scannedAt,
          userAgent: s % 2 === 0 ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' : 'Mozilla/5.0 (Linux; Android 14)',
        });
      }
    }

    if (scanEntries.length > 0) {
      await db.insert(scanLogs).values(scanEntries);
      console.log(`✅ Inserted ${scanEntries.length} realistic scan logs for accurate charts & tables.`);
    }
  }

  // 8. Seed sample customer feedback (rating 1-2 with complaints and 4-5)
  const existingFeedback = await db.select().from(customerFeedback).where(eq(customerFeedback.businessId, biz.id));
  if (existingFeedback.length === 0 && myQrs.length > 0) {
    console.log('Seeding initial customer feedback...');
    await db.insert(customerFeedback).values([
      {
        businessId: biz.id,
        qrId: myQrs[0].id,
        rating: 1,
        message: 'Pelayanan agak lama saat jam makan siang, mohon staf ditambah.',
        customerName: 'Budi Santoso',
        customerPhone: '08123456789',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        businessId: biz.id,
        qrId: myQrs[1]?.id || myQrs[0].id,
        rating: 2,
        message: 'Wi-Fi sempat lambat saat meja outdoor penuh.',
        customerName: 'Siti Rahma',
        customerPhone: '08198765432',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
      },
      {
        businessId: biz.id,
        qrId: myQrs[0].id,
        rating: 5,
        message: 'Kopi senja mantap, tempat nyaman buat WFC!',
        customerName: 'Dimas',
        customerPhone: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50),
      },
    ]);
    console.log('✅ Seeded customer feedback entries.');
  }

  console.log('✨ Database tidying complete!');
  process.exit(0);
}

tidyDatabase().catch(err => {
  console.error('Error during tidy:', err);
  process.exit(1);
});
