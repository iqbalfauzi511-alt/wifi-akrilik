/**
 * RESET SCRIPT — Cobascan WA+PIN Migration
 * 
 * Apa yang dilakukan:
 * 1. Hapus semua data owner (users non-admin) + businesses (cascade)
 * 2. Reset semua QR ke status 'blank' + putus dari business
 * 3. Tambah kolom baru: users.whatsapp_number, users.pin_hash
 * 4. Reset kolom email agar bisa nullable (owner tidak wajib punya email)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const path = await import('path');
const fs = await import('fs');
const { fileURLToPath } = await import('url');

// Load env
const dotenv = await import('dotenv');
dotenv.default.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

async function run() {
  let client;

  if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
    console.log('✅ Menggunakan PostgreSQL (Supabase)...');
    const postgres = (await import('postgres')).default;
    client = postgres(DATABASE_URL, { prepare: false, ssl: 'require' });

    await runPostgres(client);
    await client.end();
  } else {
    console.log('✅ Menggunakan PGlite lokal...');
    const { PGlite } = await import('@electric-sql/pglite');
    const dataDir = path.default.join(process.cwd(), '.data', 'pglite');
    if (!fs.default.existsSync(dataDir)) {
      console.log('  ℹ️  Tidak ada data PGlite. Database masih kosong, tidak ada yang perlu direset.');
      console.log('  → Migrasi kolom baru akan diterapkan saat server pertama kali dijalankan.');
      console.log('\n✅ SELESAI — Database sudah bersih dan siap untuk sistem WA+PIN.\n');
      return;
    }
    const db = new PGlite(dataDir);
    await runPGlite(db);
    await db.close();
  }
}

async function runPostgres(client) {
  console.log('\n🗑️  Step 1: Menghapus data owner (non-admin) dan businesses...');
  
  // Hapus businesses dulu (cascade akan hapus feedback terkait)
  const deletedBusinesses = await client`
    DELETE FROM businesses 
    WHERE owner_id IN (
      SELECT id FROM users WHERE role != 'admin'
    )
    RETURNING id
  `;
  console.log(`  → ${deletedBusinesses.length} businesses dihapus`);

  // Reset QR codes: putus dari business, kembalikan ke blank
  const resetQr = await client`
    UPDATE qr_codes 
    SET business_id = NULL, status = 'blank', 
        device_name = NULL, activated_at = NULL,
        google_maps_review_url = NULL, google_maps_url = NULL,
        wifi_enabled = false, wifi_name = NULL, wifi_password = NULL
    WHERE status != 'blank'
    RETURNING id
  `;
  console.log(`  → ${resetQr.length} QR codes direset ke blank`);

  // Hapus owner users (non-admin)
  const deletedUsers = await client`
    DELETE FROM users WHERE role != 'admin' RETURNING id
  `;
  console.log(`  → ${deletedUsers.length} user owner dihapus`);

  console.log('\n🔧 Step 2: Menambah kolom baru untuk sistem WA+PIN...');

  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_users_whatsapp_lookup ON users(whatsapp_number)`,
    // Buat email nullable untuk owner (hanya admin yang wajib punya email)
    `ALTER TABLE users ALTER COLUMN email DROP NOT NULL`,
  ];

  for (const sql of migrations) {
    try {
      await client.unsafe(sql);
      console.log(`  ✓ ${sql.substring(0, 70)}...`);
    } catch (err) {
      console.warn(`  ⚠️  Skipped (mungkin sudah ada): ${err.message.substring(0, 80)}`);
    }
  }

  console.log('\n✅ SELESAI — Database telah direset dan siap untuk sistem WA+PIN.\n');
}

async function runPGlite(db) {
  console.log('\n🗑️  Step 1: Menghapus data owner dan businesses...');

  const migrations = [
    // Reset QR dulu sebelum hapus businesses (FK constraint)
    `UPDATE qr_codes SET business_id = NULL, status = 'blank', device_name = NULL, activated_at = NULL, google_maps_review_url = NULL, google_maps_url = NULL, wifi_enabled = false, wifi_name = NULL, wifi_password = NULL WHERE status != 'blank'`,
    // Hapus feedback (FK ke business)
    `DELETE FROM customer_feedback WHERE business_id IN (SELECT id FROM businesses WHERE owner_id IN (SELECT id FROM users WHERE role != 'admin'))`,
    // Hapus businesses
    `DELETE FROM businesses WHERE owner_id IN (SELECT id FROM users WHERE role != 'admin')`,
    // Hapus owner users
    `DELETE FROM users WHERE role != 'admin'`,
  ];

  for (const sql of migrations) {
    try {
      await db.exec(sql);
      console.log(`  ✓ ${sql.substring(0, 70)}...`);
    } catch (err) {
      console.warn(`  ⚠️  ${err.message.substring(0, 80)}`);
    }
  }

  console.log('\n🔧 Step 2: Menambah kolom baru untuk sistem WA+PIN...');

  const schemaMigrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT`,
    // PGlite: buat email nullable
    `ALTER TABLE users ALTER COLUMN email DROP NOT NULL`,
  ];

  for (const sql of schemaMigrations) {
    try {
      await db.exec(sql);
      console.log(`  ✓ ${sql.substring(0, 70)}...`);
    } catch (err) {
      console.warn(`  ⚠️  Skipped: ${err.message.substring(0, 80)}`);
    }
  }

  console.log('\n✅ SELESAI — Database lokal telah direset dan siap untuk sistem WA+PIN.\n');
}

run().catch((err) => {
  console.error('\n❌ GAGAL:', err.message);
  process.exit(1);
});
