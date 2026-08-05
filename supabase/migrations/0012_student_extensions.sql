-- Migration 0012: Add Student Table Extended Columns
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS admission_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS credits_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mentor_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
