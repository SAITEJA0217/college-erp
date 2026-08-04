-- supabase/seeds/seed.sql
-- Initial lookup/static reference data for the ERP database

-- Enable necessary UUID generation in seeds if not active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Insert Colleges
INSERT INTO public.colleges (id, code, name, is_archived) VALUES
('b1a7d6e4-4a4a-4d2c-8cb4-370de8d98d24', 'NEXUS-ENG', 'Nexus Institute of Engineering and Technology', false)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Departments
INSERT INTO public.departments (id, college_id, code, name, is_archived) VALUES
('d2a7d6e4-4a4a-4d2c-8cb4-370de8d98d25', 'b1a7d6e4-4a4a-4d2c-8cb4-370de8d98d24', 'CSE', 'Computer Science and Engineering', false),
('d2a7d6e4-4a4a-4d2c-8cb4-370de8d98d26', 'b1a7d6e4-4a4a-4d2c-8cb4-370de8d98d24', 'ECE', 'Electronics and Communication Engineering', false)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Programs
INSERT INTO public.programs (id, department_id, code, name, is_archived) VALUES
('p3a7d6e4-4a4a-4d2c-8cb4-370de8d98d27', 'd2a7d6e4-4a4a-4d2c-8cb4-370de8d98d25', 'BTECH-CSE', 'Bachelor of Technology in Computer Science', false),
('p3a7d6e4-4a4a-4d2c-8cb4-370de8d98d28', 'd2a7d6e4-4a4a-4d2c-8cb4-370de8d98d26', 'BTECH-ECE', 'Bachelor of Technology in Electronics', false);

-- 4. Insert Academic Years
INSERT INTO public.academic_years (id, name, start_date, end_date, is_active, is_archived) VALUES
('a4a7d6e4-4a4a-4d2c-8cb4-370de8d98d29', '2025-2026', '2025-07-01', '2026-06-30', true, false)
ON CONFLICT DO NOTHING;

-- 5. Insert Semesters
INSERT INTO public.semesters (id, academic_year_id, program_id, semester_number, start_date, end_date, is_archived) VALUES
('s5a7d6e4-4a4a-4d2c-8cb4-370de8d98d30', 'a4a7d6e4-4a4a-4d2c-8cb4-370de8d98d29', 'p3a7d6e4-4a4a-4d2c-8cb4-370de8d98d27', 1, '2025-07-01', '2025-12-31', false),
('s5a7d6e4-4a4a-4d2c-8cb4-370de8d98d31', 'a4a7d6e4-4a4a-4d2c-8cb4-370de8d98d29', 'p3a7d6e4-4a4a-4d2c-8cb4-370de8d98d28', 1, '2025-07-01', '2025-12-31', false);

-- 6. Insert Sections
INSERT INTO public.sections (id, semester_id, name, is_archived) VALUES
('c6a7d6e4-4a4a-4d2c-8cb4-370de8d98d32', 's5a7d6e4-4a4a-4d2c-8cb4-370de8d98d30', 'Section A', false),
('c6a7d6e4-4a4a-4d2c-8cb4-370de8d98d33', 's5a7d6e4-4a4a-4d2c-8cb4-370de8d98d31', 'Section A', false);

-- 7. Insert Subjects
INSERT INTO public.subjects (id, section_id, code, name, credits, is_archived) VALUES
('t7a7d6e4-4a4a-4d2c-8cb4-370de8d98d34', 'c6a7d6e4-4a4a-4d2c-8cb4-370de8d98d32', 'CS101', 'Introduction to Computing', 4, false),
('t7a7d6e4-4a4a-4d2c-8cb4-370de8d98d35', 'c6a7d6e4-4a4a-4d2c-8cb4-370de8d98d33', 'EC101', 'Basic Electronics', 4, false);
