-- Migration Script: Password Management & First Login Security
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE;

-- Notify PostgREST to reload the schema cache so this column is immediately available via the API
NOTIFY pgrst, 'reload schema';
