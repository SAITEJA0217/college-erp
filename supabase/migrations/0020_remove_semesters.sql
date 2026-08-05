-- Migration 0020: Remove Semesters Entity completely

-- 1. Alter Sections
ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
DROP COLUMN IF EXISTS semester_id CASCADE;

-- 2. Alter Students
ALTER TABLE public.students
DROP COLUMN IF EXISTS semester_id CASCADE;

-- 3. Alter Subjects
ALTER TABLE public.subjects
DROP COLUMN IF EXISTS semester_id CASCADE;

-- 4. Alter Results
ALTER TABLE public.results
DROP COLUMN IF EXISTS semester_id CASCADE;

-- 5. Alter Global Announcements
ALTER TABLE public.global_announcements
DROP COLUMN IF EXISTS semester_id CASCADE;

-- 6. Drop Indexes (if they still exist)
DROP INDEX IF EXISTS idx_students_semester;

-- 7. Drop the semesters table
DROP TABLE IF EXISTS public.semesters CASCADE;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
