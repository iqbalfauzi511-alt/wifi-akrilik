-- Migration: Add google_maps_review_url and migrate existing google_maps_url data
-- For Smart QR + NFC direct Google Maps Review flow

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_maps_review_url text;

-- Safely backfill any existing google_maps_url into google_maps_review_url
UPDATE businesses 
SET google_maps_review_url = google_maps_url 
WHERE google_maps_review_url IS NULL AND google_maps_url IS NOT NULL;
