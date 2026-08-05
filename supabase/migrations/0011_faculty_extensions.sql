-- Migration 0011: Add Faculty Table Extended Columns & employee_id generator RPC
ALTER TABLE public.faculty
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS joining_date DATE,
  ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full Time',
  ADD COLUMN IF NOT EXISTS is_hod BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create Sequences for ID generation
CREATE SEQUENCE IF NOT EXISTS faculty_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS hod_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS placement_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS admin_id_seq START 1;

-- Create the generator RPC function
CREATE OR REPLACE FUNCTION generate_employee_id(role_name text)
RETURNS text AS $$
DECLARE
    next_val bigint;
    prefix text;
BEGIN
    IF role_name = 'faculty' THEN
        next_val := nextval('faculty_id_seq');
        prefix := 'FAC';
    ELSIF role_name = 'hod' THEN
        next_val := nextval('hod_id_seq');
        prefix := 'HOD';
    ELSIF role_name = 'placement' THEN
        next_val := nextval('placement_id_seq');
        prefix := 'PLC';
    ELSIF role_name = 'admin' THEN
        next_val := nextval('admin_id_seq');
        prefix := 'ADM';
    ELSE
        RAISE EXCEPTION 'Invalid role_name for ID generation: %', role_name;
    END IF;

    -- Format: PREFIX + 6 digits (e.g., FAC000001)
    RETURN prefix || LPAD(next_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
