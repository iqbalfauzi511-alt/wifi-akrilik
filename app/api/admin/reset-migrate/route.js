import { NextResponse } from 'next/server';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Secret key for safety - change this before using
const RESET_SECRET = process.env.RESET_SECRET || 'cobascan-reset-2026';

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.secret !== RESET_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDatabaseInitialized();

    const results = [];

    // Step 1: Reset QR codes (unlink from businesses, set back to blank)
    try {
      await db.execute(sql`
        UPDATE qr_codes 
        SET business_id = NULL, 
            status = 'blank',
            device_name = NULL, 
            activated_at = NULL,
            google_maps_review_url = NULL, 
            google_maps_url = NULL,
            wifi_enabled = false, 
            wifi_name = NULL, 
            wifi_password = NULL
        WHERE status != 'blank' OR business_id IS NOT NULL
      `);
      results.push('✅ QR codes reset ke blank');
    } catch (e) {
      results.push(`⚠️ QR reset: ${e.message}`);
    }

    // Step 2: Delete customer feedback linked to owner businesses
    try {
      await db.execute(sql`
        DELETE FROM customer_feedback 
        WHERE business_id IN (
          SELECT id FROM businesses 
          WHERE owner_id IN (SELECT id FROM users WHERE role != 'admin')
        )
      `);
      results.push('✅ Customer feedback dihapus');
    } catch (e) {
      results.push(`⚠️ Feedback: ${e.message}`);
    }

    // Step 3: Delete owner businesses
    try {
      await db.execute(sql`
        DELETE FROM businesses 
        WHERE owner_id IN (SELECT id FROM users WHERE role != 'admin')
      `);
      results.push('✅ Businesses owner dihapus');
    } catch (e) {
      results.push(`⚠️ Businesses: ${e.message}`);
    }

    // Step 4: Delete owner users (non-admin)
    try {
      await db.execute(sql`DELETE FROM users WHERE role != 'admin'`);
      results.push('✅ User owner dihapus');
    } catch (e) {
      results.push(`⚠️ Users: ${e.message}`);
    }

    // Step 5: Add whatsapp_number column
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32)`);
      results.push('✅ Kolom whatsapp_number ditambahkan');
    } catch (e) {
      results.push(`⚠️ whatsapp_number: ${e.message}`);
    }

    // Step 6: Add pin_hash column
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT`);
      results.push('✅ Kolom pin_hash ditambahkan');
    } catch (e) {
      results.push(`⚠️ pin_hash: ${e.message}`);
    }

    // Step 7: Make email nullable (owners don't need email)
    try {
      await db.execute(sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`);
      results.push('✅ Kolom email dibuat nullable');
    } catch (e) {
      results.push(`⚠️ email nullable: ${e.message}`);
    }

    // Step 8: Add unique index on whatsapp_number
    try {
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp 
        ON users(whatsapp_number) 
        WHERE whatsapp_number IS NOT NULL
      `);
      results.push('✅ Unique index whatsapp_number dibuat');
    } catch (e) {
      results.push(`⚠️ WA index: ${e.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database berhasil direset untuk sistem WA+PIN',
      results 
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
