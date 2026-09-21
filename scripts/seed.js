import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users, businesses, qrCodes, scanLogs } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...');
  await ensureDatabaseInitialized();
  const db = getDb();

  // 1. Create Admin User
  let [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@smartwifi.com'));

  if (!admin) {
    [admin] = await db
      .insert(users)
      .values({
        email: 'admin@smartwifi.com',
        name: 'Admin Utama',
        role: 'admin',
      })
      .returning();
    console.log('✅ Created Admin user:', admin.email);
  }

  // 2. Create Customer User (Ahmad - Kopi Senja)
  let [customer] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'ahmad@kopisenja.com'));

  if (!customer) {
    [customer] = await db
      .insert(users)
      .values({
        email: 'ahmad@kopisenja.com',
        name: 'Ahmad',
        role: 'customer',
      })
      .returning();
    console.log('✅ Created Customer user:', customer.email);
  }

  // 3. Create Business for Kopi Senja
  let [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, customer.id));

  if (!business) {
    [business] = await db
      .insert(businesses)
      .values({
        ownerId: customer.id,
        businessName: 'Kopi Senja',
        instagramUrl: 'https://www.instagram.com/kopisenja/',
        wifiName: 'KOPI SENJA',
        wifiPassword: 'kopisenja123',
      })
      .returning();
    console.log('✅ Created Business:', business.businessName);
  } else {
    [business] = await db
      .update(businesses)
      .set({
        instagramUrl: 'https://www.instagram.com/kopisenja/',
      })
      .where(eq(businesses.id, business.id))
      .returning();
    console.log('✅ Updated Business with instagram_url:', business.instagramUrl);
  }

  // 4. Create Sample QR Codes
  const sampleQrs = [
    {
      code: 'SW-KOP001',
      status: 'active',
      businessId: business.id,
      soldAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      activatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
    {
      code: 'SW-KOP002',
      status: 'sold',
      businessId: null,
      soldAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      activatedAt: null,
    },
    {
      code: 'SW-BLANK1',
      status: 'blank',
      businessId: null,
      soldAt: null,
      activatedAt: null,
    },
  ];

  for (const item of sampleQrs) {
    const existing = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.code, item.code));

    if (existing.length === 0) {
      const [inserted] = await db.insert(qrCodes).values(item).returning();
      console.log(`✅ Created QR Code: ${inserted.code} (${inserted.status})`);

      // If active, add some initial scans
      if (inserted.status === 'active') {
        await db.insert(scanLogs).values([
          { qrId: inserted.id, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
          { qrId: inserted.id, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' },
          { qrId: inserted.id, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)' },
        ]);
        console.log('   ↳ Added 3 sample scan logs');
      }
    }
  }

  console.log('🎉 Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
