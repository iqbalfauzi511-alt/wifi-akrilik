-- Migration 0005: Add WhatsApp number to businesses, password & verification to users, and customer_feedback table

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);

CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  qr_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  message TEXT,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_business ON customer_feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_qr ON customer_feedback(qr_id);
