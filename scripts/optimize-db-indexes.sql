-- Database Performance Optimization Script for MRUH ERP
-- Run this in the Supabase SQL Editor

-- 1. Create indexes for frequently queried Foreign Keys
-- These significantly speed up JOINs and WHERE clauses, especially when the tables grow large.

CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_faculty_profile_id ON public.faculty_class_assignments (faculty_profile_id);
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_department_id ON public.faculty_class_assignments (department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_semester_id ON public.faculty_class_assignments (semester_id);
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_section_id ON public.faculty_class_assignments (section_id);
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_subject_id ON public.faculty_class_assignments (subject_id);

CREATE INDEX IF NOT EXISTS idx_semesters_program_id ON public.semesters (program_id);
CREATE INDEX IF NOT EXISTS idx_semesters_academic_year_id ON public.semesters (academic_year_id);

CREATE INDEX IF NOT EXISTS idx_sections_semester_id ON public.sections (semester_id);

CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON public.subjects (semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department_id ON public.subjects (department_id);

CREATE INDEX IF NOT EXISTS idx_programs_department_id ON public.programs (department_id);

CREATE INDEX IF NOT EXISTS idx_faculty_profile_id ON public.faculty (profile_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department_id ON public.faculty (department_id);

CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students (profile_id);
CREATE INDEX IF NOT EXISTS idx_students_department_id ON public.students (department_id);
CREATE INDEX IF NOT EXISTS idx_students_semester_id ON public.students (semester_id);
CREATE INDEX IF NOT EXISTS idx_students_section_id ON public.students (section_id);

CREATE INDEX IF NOT EXISTS idx_timetables_section_id ON public.timetables (section_id);
CREATE INDEX IF NOT EXISTS idx_timetables_subject_id ON public.timetables (subject_id);
CREATE INDEX IF NOT EXISTS idx_timetables_faculty_id ON public.timetables (faculty_id);

-- 2. Create indexes for boolean filtering flags (used in almost every query)
CREATE INDEX IF NOT EXISTS idx_profiles_is_archived ON public.profiles (is_archived);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_is_archived ON public.faculty_class_assignments (is_archived);
CREATE INDEX IF NOT EXISTS idx_faculty_class_assignments_status ON public.faculty_class_assignments (status);

CREATE INDEX IF NOT EXISTS idx_departments_is_archived ON public.departments (is_archived);
CREATE INDEX IF NOT EXISTS idx_programs_is_archived ON public.programs (is_archived);
CREATE INDEX IF NOT EXISTS idx_semesters_is_archived ON public.semesters (is_archived);
CREATE INDEX IF NOT EXISTS idx_sections_is_archived ON public.sections (is_archived);
CREATE INDEX IF NOT EXISTS idx_subjects_is_archived ON public.subjects (is_archived);
CREATE INDEX IF NOT EXISTS idx_timetables_is_archived ON public.timetables (is_archived);
