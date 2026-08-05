-- Migration Script: Automatic Identifier Generation
-- Run this in your Supabase SQL Editor

-- 1. Create sequences for each role
CREATE SEQUENCE IF NOT EXISTS faculty_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS hod_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS placement_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS admin_id_seq START 1;

-- 2. Create the generator function
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

-- 3. Notify PostgREST to reload the schema cache so this function is immediately available via the API
NOTIFY pgrst, 'reload schema';
