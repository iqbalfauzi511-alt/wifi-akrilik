-- Migration 0006: Add wifi_username to businesses and qr_codes, and provision Super Admin
-- Ensures compatibility with voucher hotspot auth and initial administrative login

-- 1. Add wifi_username columns to businesses & qr_codes
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS wifi_username VARCHAR(255);
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS wifi_username VARCHAR(255);

-- 2. Ensure users table has all required auth columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

-- 3. Provision or Update Super Admin with default PIN: 654321
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
