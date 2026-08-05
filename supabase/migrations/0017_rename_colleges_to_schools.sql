-- ============================================================
-- Migration 0017: Rename colleges to schools
-- ============================================================
-- This migration introduces the "Schools" layer into the academic
-- hierarchy by renaming the existing `colleges` table to `schools`.
-- All data, UUIDs, and relationships are preserved.

-- 1. Rename the table
ALTER TABLE colleges RENAME TO schools;

-- 2. Rename the FK column in departments
ALTER TABLE departments RENAME COLUMN college_id TO school_id;

-- 3. Update any indexes that reference the old column name
-- (indexes on departments.college_id are auto-renamed by Postgres
--  when the column is renamed, but let's be explicit for clarity)

-- 4. Enable RLS on schools (was already enabled on colleges via 0008)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for the renamed table
-- Allow all authenticated users to read schools
CREATE POLICY "Schools are viewable by authenticated users"
  ON schools FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to manage schools
CREATE POLICY "Admins can manage schools"
  ON schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
