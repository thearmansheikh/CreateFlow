-- Add is_default column to brand_profiles for workspace auto-selection
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure only one default per user (RLS filtered by user_id)
CREATE UNIQUE INDEX idx_brand_profiles_default ON brand_profiles (user_id, is_default) WHERE is_default = TRUE;
