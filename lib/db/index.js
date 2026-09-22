import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import postgres from 'postgres';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

let _db = null;
let _client = null;
let _isInitialized = false;

export function getDb() {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // Production / Supabase PostgreSQL connection
    // Supabase requires ssl: 'require' from cloud/Vercel environments
    _client = postgres(databaseUrl, {
      prepare: false, // Required for Supabase PgBouncer pooling
      max: 5,
      ssl: databaseUrl.includes('localhost') ? false : 'require',
      connect_timeout: 10,
    });
    _db = drizzlePg(_client, { schema });
  } else {
    // Check if running on Vercel / serverless environment
    if (process.env.VERCEL) {
      // In Vercel serverless production, process.cwd() and /tmp are ephemeral across lambdas.
      // Silently falling back to PGlite would cause data created by one request to disappear on the next request.
      throw new Error(
        '[COBASCAN_CONFIG_ERROR] Variabel DATABASE_URL belum diisi pada Vercel Production. ' +
        'Silakan buka Vercel Dashboard > Project Settings > Environment Variables dan masukkan DATABASE_URL PostgreSQL Anda.'
      );
    }

    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isServerless) {
      try {
        const tmpDir = path.join('/tmp', 'pglite');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        _client = new PGlite(tmpDir);
      } catch (err) {
        console.warn('Failed to use /tmp/pglite, falling back to in-memory PGlite:', err);
        _client = new PGlite();
      }
    } else {
      const dataDir = path.join(process.cwd(), '.data', 'pglite');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      _client = new PGlite(dataDir);
    }
    _db = drizzlePglite(_client, { schema });
  }

  return _db;
}

export async function ensureDatabaseInitialized() {
  if (_isInitialized) return;

  try {
    const db = getDb();
    const initSql = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(32) NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        logo_url TEXT,
        google_maps_review_url TEXT,
        google_maps_url TEXT,
        wifi_enabled BOOLEAN DEFAULT false,
        instagram_url TEXT,
        wifi_name VARCHAR(255),
        wifi_password VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_maps_review_url TEXT;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS wifi_enabled BOOLEAN DEFAULT false;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_url TEXT;
      ALTER TABLE businesses ALTER COLUMN instagram_url DROP NOT NULL;
      ALTER TABLE businesses ALTER COLUMN wifi_name DROP NOT NULL;
      ALTER TABLE businesses ALTER COLUMN wifi_password DROP NOT NULL;
      UPDATE businesses SET google_maps_review_url = google_maps_url WHERE google_maps_review_url IS NULL AND google_maps_url IS NOT NULL;

      CREATE TABLE IF NOT EXISTS qr_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_code VARCHAR(64) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(64) NOT NULL UNIQUE,
        status VARCHAR(32) NOT NULL DEFAULT 'blank',
        business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
        batch_id UUID REFERENCES qr_batches(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        sold_at TIMESTAMP WITH TIME ZONE,
        activated_at TIMESTAMP WITH TIME ZONE
      );

      ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES qr_batches(id) ON DELETE SET NULL;
      ALTER TABLE qr_codes DROP CONSTRAINT IF EXISTS check_qr_status;
      ALTER TABLE qr_codes ADD CONSTRAINT check_qr_status CHECK (status IN ('blank', 'sold', 'active', 'disabled'));

      CREATE TABLE IF NOT EXISTS scan_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        qr_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
        scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        user_agent TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON qr_codes(business_id);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
      CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_id ON scan_logs(qr_id);
    `;

    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      if (_client && _client.unsafe) {
        await _client.unsafe(initSql);
      }
    } else if (_client && _client.exec) {
      await _client.exec(initSql);
    }

    _isInitialized = true;
  } catch (error) {
    console.error('Database initialization warning (safe to ignore if tables exist):', error?.message || error);
  }
}

export const db = new Proxy({}, {
  get(target, prop) {
    const instance = getDb();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
