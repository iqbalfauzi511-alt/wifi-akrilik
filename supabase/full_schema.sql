-- =========================================================
-- COBASCAN COMPLETE DATABASE SCHEMA FOR SUPABASE POSTGRESQL
-- =========================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
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

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
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

-- 3. QR Batches Table
CREATE TABLE IF NOT EXISTS qr_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. QR Codes Table
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

-- 5. Scan Logs Table
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    action_type VARCHAR(32) NOT NULL DEFAULT 'page_view'
);

-- 6. Finance Transactions Table
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

-- 7. Journal Entries Table
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

-- 8. Journal Items Table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_id ON scan_logs(qr_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON scan_logs(scanned_at);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_items_entry_id ON journal_items(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_account ON journal_items(account_code);

-- =========================================================
-- INITIAL SUPER ADMIN PROVISIONING (PIN: 654321)
-- =========================================================
INSERT INTO users (
    name, 
    whatsapp_number, 
    role, 
    email_verified, 
    pin_hash,
    failed_login_attempts,
    locked_until
)
VALUES (
    'Super Admin',
    '6285888159265',
    'admin',
    true,
    'pbkdf2:210000:5240144c4621874a4e341f1751d3d8a0:4bbea58528abe768a1b6a6b618f9360c6f121aa5825c73e3fa11a69b6f2a8556f8e2a4763260e548952894fddb0d971b5c78dccb82e4f61d59c2f1fb09269820',
    0,
    null
)
ON CONFLICT (whatsapp_number) DO UPDATE SET
    role = 'admin',
    pin_hash = 'pbkdf2:210000:5240144c4621874a4e341f1751d3d8a0:4bbea58528abe768a1b6a6b618f9360c6f121aa5825c73e3fa11a69b6f2a8556f8e2a4763260e548952894fddb0d971b5c78dccb82e4f61d59c2f1fb09269820',
    failed_login_attempts = 0,
    locked_until = null;
