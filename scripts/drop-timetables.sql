-- Drop the background trigger that synced faculty_class_assignments to timetables
DROP TRIGGER IF EXISTS trg_sync_faculty_assignment ON public.faculty_class_assignments;
DROP FUNCTION IF EXISTS sync_faculty_assignment_to_timetable();

-- Drop the timetables table as faculty_class_assignments will be the single source of truth
DROP TABLE IF EXISTS public.timetables CASCADE;
