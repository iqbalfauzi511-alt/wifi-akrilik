-- Migration 0005: WA+PIN Auth, Device Overrides, Scan Action Types, and Finance/Accounting Schema
-- Ensures Supabase PostgreSQL matches lib/db/schema.js and Drizzle migrations exactly.

-- 1. Users table updates (WA+PIN auth, brute force protection, optional email)
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Businesses table updates
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);

-- 3. QR Codes per-device override fields
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS device_name VARCHAR(255);
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS google_maps_review_url TEXT;
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS wifi_name VARCHAR(255);
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS wifi_password VARCHAR(255);
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS wifi_enabled BOOLEAN;
ALTER TABLE qr_codes ALTER COLUMN wifi_enabled DROP NOT NULL;
ALTER TABLE qr_codes ALTER COLUMN wifi_enabled DROP DEFAULT;
ALTER TABLE qr_codes DROP COLUMN IF EXISTS activation_code;

-- 4. Scan logs action type tracking
ALTER TABLE scan_logs ADD COLUMN IF NOT EXISTS action_type VARCHAR(32) NOT NULL DEFAULT 'page_view';

-- 5. Drop obsolete customer_feedback table if it exists
DROP TABLE IF EXISTS customer_feedback CASCADE;

-- 6. Finance and Double-Entry Bookkeeping Tables
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

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_items_entry_id ON journal_items(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_account ON journal_items(account_code);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_id ON scan_logs(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
