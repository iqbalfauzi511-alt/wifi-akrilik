-- ==========================================
-- SMART WI-FI QR BATCHES MIGRATION
-- ==========================================

-- 1. Create QR Batches table
CREATE TABLE IF NOT EXISTS qr_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Add batch_id to qr_codes
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES qr_batches(id) ON DELETE SET NULL;

-- 3. Create index for batch lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
