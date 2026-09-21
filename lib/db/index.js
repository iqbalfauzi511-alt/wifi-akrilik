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
    _client = postgres(databaseUrl, { prepare: false, max: 10 });
    _db = drizzlePg(_client, { schema });
  } else {
    // Local embedded PostgreSQL engine (PGlite)
    // Ensures real PostgreSQL execution with zero external dependencies
    const dataDir = path.join(process.cwd(), '.data', 'pglite');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    _client = new PGlite(dataDir);
    _db = drizzlePglite(_client, { schema });
  }

  return _db;
}

export async function ensureDatabaseInitialized() {
  if (_isInitialized) return;
  const db = getDb();

  try {
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
        instagram_url TEXT NOT NULL,
        wifi_name VARCHAR(255) NOT NULL,
        wifi_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_url TEXT;

      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(64) NOT NULL UNIQUE,
        status VARCHAR(32) NOT NULL DEFAULT 'blank',
        business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        sold_at TIMESTAMP WITH TIME ZONE,
        activated_at TIMESTAMP WITH TIME ZONE
      );

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
      CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_id ON scan_logs(qr_id);
    `;

    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      await _client.unsafe(initSql);
    } else if (_client && _client.exec) {
      await _client.exec(initSql);
    }

    _isInitialized = true;
  } catch (error) {
    console.error('Database initialization warning:', error);
  }
}

export const db = new Proxy({}, {
  get(target, prop) {
    const instance = getDb();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
