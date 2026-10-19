import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { sql, eq } from 'drizzle-orm';
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
      prepare: false, // Required for Supabase PgBouncer / Supavisor pooling
      max: 10, // Increase max to prevent Promise.all deadlocks on serverless
      idle_timeout: 20, // Discard idle connections before Supabase pooler drops them
      max_lifetime: 60 * 30, // 30 minutes max lifetime
      connect_timeout: 10, // Drop quickly so Vercel can return error
      ssl: databaseUrl.includes('localhost') ? false : 'require',
      onnotice: () => {},
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

    const isTest = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1' || process.env.IS_TEST === '1';
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isTest) {
      cache.client = new PGlite();
    } else if (isServerless) {
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
      const dataDir = path.join(process.cwd(), '.data', 'pglite');
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        } else {
          // Remove stale postmaster.pid from ungraceful kill/shutdown to prevent PGlite startup abort
          const pidFile = path.join(dataDir, 'postmaster.pid');
          if (fs.existsSync(pidFile)) {
            try {
              fs.unlinkSync(pidFile);
            } catch (e) {
              console.warn('[DB] Failed to remove stale postmaster.pid:', e?.message || e);
            }
          }
        }
        cache.client = new PGlite(dataDir);
      } catch (err) {
        console.warn('Could not open persistent .data/pglite, falling back to in-memory PGlite:', err?.message || err);
        cache.client = new PGlite();
      }
    }
    cache.db = drizzlePglite(cache.client, { schema });
  }

  return cache.db;
}

async function applyRuntimeMigrations(database) {
  if (cache.migratedWifiUsername || !database) return;
  try {
    if (typeof database.execute === 'function') {
      await database.execute(sql`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS wifi_username VARCHAR(255)`);
      await database.execute(sql`ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS wifi_username VARCHAR(255)`);
      cache.migratedWifiUsername = true;
    }
  } catch (e) {
    console.warn('[DB MIGRATION] wifi_username notice:', e?.message || e);
  }
}

async function provisionAdminUser(database) {
  const adminWa = (process.env.ADMIN_WA || '').trim();
  const configuredEmail = (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',')[0].trim().toLowerCase() : '') || null;

  if (!adminWa || cache.adminBootstrapped || !database) return;

  try {
    const existing = await database
      .select({
        id: schema.users.id,
        pinHash: schema.users.pinHash,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.whatsappNumber, adminWa))
      .limit(1);

    const { hashPassword } = await import('../auth/password.js');
    const adminPinHash = hashPassword('654321');

    if (existing.length === 0) {
      await database.insert(schema.users).values({
        name: 'Super Admin',
        whatsappNumber: adminWa,
        email: configuredEmail,
        pinHash: adminPinHash,
        role: 'admin',
        emailVerified: true,
      });
      console.log('[DB INIT] Configured admin provisioned successfully.');
    } else if (!existing[0].pinHash || existing[0].role !== 'admin') {
      await database
        .update(schema.users)
        .set({
          pinHash: existing[0].pinHash || adminPinHash,
          role: 'admin',
          failedLoginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, existing[0].id));
      console.log('[DB INIT] Configured admin synced with pin_hash and admin role.');
    }
    cache.adminBootstrapped = true;
  } catch (adminErr) {
    console.warn('[DB INIT] Admin initial check notice:', adminErr?.message || adminErr);
  }
}

export async function ensureDatabaseInitialized() {
  if (cache.isInitialized) {
    await applyRuntimeMigrations(cache.db);
    await provisionAdminUser(cache.db);
    return;
  }
  if (cache.initPromise) return cache.initPromise;

  cache.initPromise = (async () => {
    try {
      getDb(); // Ensure cache.client is initialized
      const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

      // For PGlite, verify client is ready. If WAL checkpoint is corrupted (WASM Aborted), auto-recover by rotating dataDir
      if (!isPostgres && cache.client?.waitReady) {
        try {
          await cache.client.waitReady;
        } catch (readyErr) {
          console.error('[DB INIT] PGlite failed to initialize (corrupted WAL or crash):', readyErr?.message || readyErr);
          const dataDir = path.join(process.cwd(), '.data', 'pglite');
          const corruptedDir = path.join(process.cwd(), '.data', `pglite_corrupted_${Date.now()}`);
          try {
            if (fs.existsSync(dataDir)) {
              fs.renameSync(dataDir, corruptedDir);
              fs.mkdirSync(dataDir, { recursive: true });
            }
          } catch (mvErr) {
            console.warn('[DB INIT] Could not rotate corrupted directory:', mvErr);
          }
          // Reset client and db with clean storage
          cache.client = new PGlite(dataDir);
          cache.db = drizzlePglite(cache.client, { schema });
          await cache.client.waitReady;
        }
      }

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
          wifi_username VARCHAR(255),
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
          wifi_username VARCHAR(255),
          wifi_password VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          sold_at TIMESTAMP WITH TIME ZONE,
          activated_at TIMESTAMP WITH TIME ZONE
        );

        -- Make qr_codes.wifi_enabled nullable for per-device override logic (null = inherit from business)
        ALTER TABLE qr_codes ALTER COLUMN wifi_enabled DROP NOT NULL;
        ALTER TABLE qr_codes ALTER COLUMN wifi_enabled DROP DEFAULT;
        ALTER TABLE businesses ADD COLUMN IF NOT EXISTS wifi_username VARCHAR(255);
        ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS wifi_username VARCHAR(255);

        CREATE TABLE IF NOT EXISTS scan_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          qr_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
          scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          user_agent TEXT,
          action_type VARCHAR(32) NOT NULL DEFAULT 'page_view'
        );

        ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS action_type VARCHAR(32) NOT NULL DEFAULT 'page_view';

        CREATE TABLE IF NOT EXISTS finance_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(16) NOT NULL,
          category VARCHAR(64) NOT NULL,
          amount INTEGER NOT NULL,
          transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          description TEXT,
          reference_number VARCHAR(64),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS journal_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          finance_transaction_id UUID REFERENCES finance_transactions(id) ON DELETE CASCADE,
          entry_number VARCHAR(64) NOT NULL,
          entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          description TEXT,
          reference_number VARCHAR(64),
          transaction_type VARCHAR(32) NOT NULL DEFAULT 'jurnal_umum',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS finance_transaction_id UUID REFERENCES finance_transactions(id) ON DELETE CASCADE;

        CREATE TABLE IF NOT EXISTS journal_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
          account_code VARCHAR(16) NOT NULL,
          account_name VARCHAR(255) NOT NULL,
          debit INTEGER NOT NULL DEFAULT 0,
          credit INTEGER NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
        CREATE INDEX IF NOT EXISTS idx_journal_items_entry_id ON journal_items(entry_id);
        CREATE INDEX IF NOT EXISTS idx_journal_items_account ON journal_items(account_code);

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON qr_codes(business_id);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
        CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_id ON scan_logs(qr_id);
        CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_transactions(type);
        CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(transaction_date);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
        DROP TABLE IF EXISTS customer_feedback CASCADE;
      `;

      // Clean comments and prepare discrete statements
      const cleanSql = initSql.replace(/--.*$/gm, '');
      const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

      if (isPostgres) {
        // SKIP DDL in production PostgreSQL (Supabase) to prevent Connection Closed errors.
        // The user will run the SQL manually in the Supabase SQL Editor.
        console.log('[DB INIT] Skipping DDL execution on Supabase. Tables should be created manually.');
      } else if (cache.client && cache.client.exec) {
        for (const stmt of statements) {
          try {
            await cache.client.exec(stmt);
          } catch (stmtErr) {
            console.warn('[PGLite Init Warning] Statement skipped:', stmt.substring(0, 80), '|', stmtErr?.message || stmtErr);
          }
        }
      }

      // Run runtime migrations (e.g. wifi_username) and provision initial administrator
      await applyRuntimeMigrations(cache.db);
      await provisionAdminUser(cache.db);
      
      cache.isInitialized = true;
    } catch (error) {
      console.warn('Database initialization caught non-fatal exception:', error?.message || error);
      // If error was connection closed, reset cache so subsequent queries recreate client
      if (error?.message?.includes('closed') || error?.message?.includes('Connection')) {
        cache.client = null;
        cache.db = null;
      }
      cache.isInitialized = false;
      cache.initPromise = null;
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
