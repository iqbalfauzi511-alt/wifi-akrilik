-- Migration: Add logo_url column to businesses table
-- Safe idempotent migration
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
