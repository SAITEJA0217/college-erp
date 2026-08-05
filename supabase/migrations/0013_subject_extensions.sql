-- Migration 0013: Add Subject Table Extended Columns
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
