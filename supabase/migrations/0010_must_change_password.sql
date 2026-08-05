-- Migration 0010: Add must_change_password to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
