-- Migration: 0003_smart_qr_nfc.sql
-- Add Google Maps Rating and Optional Wi-Fi fields to businesses

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS wifi_enabled BOOLEAN DEFAULT false;
ALTER TABLE businesses ALTER COLUMN instagram_url DROP NOT NULL;
ALTER TABLE businesses ALTER COLUMN wifi_name DROP NOT NULL;
ALTER TABLE businesses ALTER COLUMN wifi_password DROP NOT NULL;
