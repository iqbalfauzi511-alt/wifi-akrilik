import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import postgres from 'postgres';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

const globalForDb = globalThis;

if (!globalForDb.smartWifiDbCache) {
  globalForDb.smartWifiDbCache = {
    db: null,
    client: null,
    isInitialized: false,
    initPromise: null,
  };
}

const cache = globalForDb.smartWifiDbCache;

export function getDb() {
  if (cache.db) return cache.db;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // Production / Supabase PostgreSQL connection
    // Supabase requires ssl: 'require' from cloud/Vercel environments
    cache.client = postgres(databaseUrl, {
      prepare: false, // Required for Supabase PgBouncer pooling
      max: 5,
      ssl: databaseUrl.includes('localhost') ? false : 'require',
      connect_timeout: 10,
    });
    cache.db = drizzlePg(cache.client, { schema });
  } else {
    // Check if running on Vercel / serverless environment
    if (process.env.VERCEL) {
      // In Vercel serverless production, process.cwd() and /tmp are ephemeral across lambdas.
      // Silently falling back to PGlite would cause data created by one request to disappear on the next request.
      throw new Error(
        'Variabel DATABASE_URL belum diisi pada Vercel Production. ' +
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
        cache.client = new PGlite(tmpDir);
      } catch (err) {
        console.warn('Failed to use /tmp/pglite, falling back to in-memory PGlite:', err);
        cache.client = new PGlite();
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        // Use in-memory PGlite for local development to avoid WebAssembly Aborted() crash during Next.js Fast Refresh
        console.warn('Using in-memory PGlite for local development');
        cache.client = new PGlite();
      } else {
        const dataDir = path.join(process.cwd(), '.data', 'pglite');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        cache.client = new PGlite(dataDir);
      }
    }
    cache.db = drizzlePglite(cache.client, { schema });
  }

  return cache.db;
}

export async function ensureDatabaseInitialized() {
  if (cache.isInitialized) return;
  if (cache.initPromise) return cache.initPromise;

  cache.initPromise = (async () => {
    try {
      getDb(); // Ensure cache.client is initialized
      const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

      // Lightweight non-locking IF NOT EXISTS DDL (runs once per process)
      // Removed production skip so tables can be created on Supabase.
      const initSql = `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE,
          name VARCHAR(255),
          avatar_url TEXT,
          role VARCHAR(32) NOT NULL DEFAULT 'customer',
          password_hash TEXT,
          email_verified BOOLEAN DEFAULT false,
          whatsapp_number VARCHAR(32),
          pin_hash TEXT,
          failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
          locked_until TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        -- Add columns for existing databases safely
        ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0 NOT NULL;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
        ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS action_type VARCHAR(32) NOT NULL DEFAULT 'page_view';

        CREATE TABLE IF NOT EXISTS businesses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          business_name VARCHAR(255) NOT NULL,
          logo_url TEXT,
          googleMapsReviewUrl TEXT,
          google_maps_review_url TEXT,
          google_maps_url TEXT,
          wifi_enabled BOOLEAN DEFAULT false,
          wifi_name VARCHAR(255),
          wifi_password VARCHAR(255),
          whatsapp_number VARCHAR(32),
          instagram_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

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
          device_name VARCHAR(255),
          google_maps_review_url TEXT,
          google_maps_url TEXT,
          wifi_enabled BOOLEAN,
          wifi_name VARCHAR(255),
          wifi_password VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          sold_at TIMESTAMP WITH TIME ZONE,
          activated_at TIMESTAMP WITH TIME ZONE
        );

        -- Make qr_codes.wifi_enabled nullable for per-device override logic (null = inherit from business)
        ALTER TABLE qr_codes ALTER COLUMN wifi_enabled DROP NOT NULL;
        ALTER TABLE qr_codes ALTER COLUMN wifi_enabled DROP DEFAULT;

        CREATE TABLE IF NOT EXISTS scan_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          qr_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
          scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          user_agent TEXT,
          action_type VARCHAR(32) NOT NULL DEFAULT 'page_view'
        );


        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON qr_codes(business_id);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
        CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_id ON scan_logs(qr_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
        DROP TABLE IF EXISTS customer_feedback CASCADE;
      `;

      // Clean comments and prepare discrete statements
      const cleanSql = initSql.replace(/--.*$/gm, '');
      const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

      if (isPostgres) {
        for (const stmt of statements) {
          try {
            await cache.client.unsafe(stmt);
          } catch (stmtErr) {
            console.warn('[DB INIT] Statement skipped:', stmt.substring(0, 80), '|', stmtErr.message);
          }
        }
      } else if (cache.client && cache.client.exec) {
        for (const stmt of statements) {
          try {
            await cache.client.exec(stmt);
          } catch (stmtErr) {
            console.warn('[PGLite Init Warning] Statement skipped:', stmt.substring(0, 80), '|', stmtErr?.message || stmtErr);
          }
        }
      }
      
      cache.isInitialized = true;
    } catch (error) {
      cache.isInitialized = false;
      cache.initPromise = null;
      console.error('CRITICAL: Database initialization failed:', error);
      throw error;
    }
  })();

  return cache.initPromise;
}

export const db = new Proxy({}, {
  get(target, prop) {
    const instance = getDb();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
