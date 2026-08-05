-- supabase/seeds/seed.sql
-- Initial lookup/static reference data for the ERP database

-- 1. Insert Schools (has UNIQUE constraint on code)
INSERT INTO public.schools (id, code, name, is_archived) 
VALUES (gen_random_uuid(), 'MRUH', 'Malla Reddy University', false)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Departments (has UNIQUE constraint on code)
INSERT INTO public.departments (id, school_id, code, name, is_archived) 
VALUES 
(
  gen_random_uuid(), 
  (SELECT id FROM public.schools WHERE code = 'MRUH' LIMIT 1), 
  'CSE', 
  'Computer Science and Engineering', 
  false
),
(
  gen_random_uuid(), 
  (SELECT id FROM public.schools WHERE code = 'MRUH' LIMIT 1), 
  'ECE', 
  'Electronics and Communication Engineering', 
  false
)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Programs (NO unique constraint on code, use WHERE NOT EXISTS)
INSERT INTO public.programs (id, department_id, code, name, is_archived)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.departments WHERE code = 'CSE' LIMIT 1),
  'BTECH-CSE',
  'Bachelor of Technology in Computer Science',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.programs WHERE code = 'BTECH-CSE'
);

INSERT INTO public.programs (id, department_id, code, name, is_archived)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.departments WHERE code = 'ECE' LIMIT 1),
  'BTECH-ECE',
  'Bachelor of Technology in Electronics',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.programs WHERE code = 'BTECH-ECE'
);

-- 4. Insert Academic Years (NO unique constraint, use WHERE NOT EXISTS)
INSERT INTO public.academic_years (id, name, start_date, end_date, is_active, is_archived)
SELECT
  gen_random_uuid(),
  '2025-2026',
  '2025-07-01',
  '2026-06-30',
  true,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.academic_years WHERE name = '2025-2026'
);

-- 5. Insert Semesters (NO unique constraint, use WHERE NOT EXISTS)
INSERT INTO public.semesters (id, academic_year_id, program_id, semester_number, start_date, end_date, is_archived)
SELECT
  gen_random_uuid(),
  (SELECT id FROM public.academic_years WHERE name = '2025-2026' LIMIT 1),
  (SELECT id FROM public.programs WHERE code = 'BTECH-CSE' LIMIT 1),
  1,
  '2025-07-01',
  '2025-12-31',
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.semesters 
  WHERE academic_year_id = (SELECT id FROM public.academic_years WHERE name = '2025-2026' LIMIT 1)
    AND program_id = (SELECT id FROM public.programs WHERE code = 'BTECH-CSE' LIMIT 1)
    AND semester_number = 1
);

INSERT INTO public.semesters (id, academic_year_id, program_id, semester_number, start_date, end_date, is_archived)
SELECT
  gen_random_uuid(),
  (SELECT id FROM public.academic_years WHERE name = '2025-2026' LIMIT 1),
  (SELECT id FROM public.programs WHERE code = 'BTECH-ECE' LIMIT 1),
  1,
  '2025-07-01',
  '2025-12-31',
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.semesters 
  WHERE academic_year_id = (SELECT id FROM public.academic_years WHERE name = '2025-2026' LIMIT 1)
    AND program_id = (SELECT id FROM public.programs WHERE code = 'BTECH-ECE' LIMIT 1)
    AND semester_number = 1
);

-- 6. Insert Sections (NO unique constraint, use WHERE NOT EXISTS)
INSERT INTO public.sections (id, semester_id, name, is_archived)
SELECT
  gen_random_uuid(),
  (
    SELECT s.id 
    FROM public.semesters s 
    JOIN public.programs p ON s.program_id = p.id 
    WHERE p.code = 'BTECH-CSE' AND s.semester_number = 1 
    LIMIT 1
  ),
  'Section A',
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.sections 
  WHERE semester_id = (
    SELECT s.id 
    FROM public.semesters s 
    JOIN public.programs p ON s.program_id = p.id 
    WHERE p.code = 'BTECH-CSE' AND s.semester_number = 1 
    LIMIT 1
  ) AND name = 'Section A'
);

INSERT INTO public.sections (id, semester_id, name, is_archived)
SELECT
  gen_random_uuid(),
  (
    SELECT s.id 
    FROM public.semesters s 
    JOIN public.programs p ON s.program_id = p.id 
    WHERE p.code = 'BTECH-ECE' AND s.semester_number = 1 
    LIMIT 1
  ),
  'Section A',
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.sections 
  WHERE semester_id = (
    SELECT s.id 
    FROM public.semesters s 
    JOIN public.programs p ON s.program_id = p.id 
    WHERE p.code = 'BTECH-ECE' AND s.semester_number = 1 
    LIMIT 1
  ) AND name = 'Section A'
);

-- 7. Insert Subjects (NO unique constraint, use WHERE NOT EXISTS)
INSERT INTO public.subjects (id, section_id, code, name, credits, is_archived)
SELECT
  gen_random_uuid(),
  (
    SELECT sec.id 
    FROM public.sections sec 
    JOIN public.semesters sem ON sec.semester_id = sem.id 
    JOIN public.programs prog ON sem.program_id = prog.id 
    WHERE prog.code = 'BTECH-CSE' AND sem.semester_number = 1 AND sec.name = 'Section A'
    LIMIT 1
  ),
  'CS101',
  'Introduction to Computing',
  4,
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.subjects 
  WHERE section_id = (
    SELECT sec.id 
    FROM public.sections sec 
    JOIN public.semesters sem ON sec.semester_id = sem.id 
    JOIN public.programs prog ON sem.program_id = prog.id 
    WHERE prog.code = 'BTECH-CSE' AND sem.semester_number = 1 AND sec.name = 'Section A'
    LIMIT 1
  ) AND code = 'CS101'
);

INSERT INTO public.subjects (id, section_id, code, name, credits, is_archived)
SELECT
  gen_random_uuid(),
  (
    SELECT sec.id 
    FROM public.sections sec 
    JOIN public.semesters sem ON sec.semester_id = sem.id 
    JOIN public.programs prog ON sem.program_id = prog.id 
    WHERE prog.code = 'BTECH-ECE' AND sem.semester_number = 1 AND sec.name = 'Section A'
    LIMIT 1
  ),
  'EC101',
  'Basic Electronics',
  4,
  false
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.subjects 
  WHERE section_id = (
    SELECT sec.id 
    FROM public.sections sec 
    JOIN public.semesters sem ON sec.semester_id = sem.id 
    JOIN public.programs prog ON sem.program_id = prog.id 
    WHERE prog.code = 'BTECH-ECE' AND sem.semester_number = 1 AND sec.name = 'Section A'
    LIMIT 1
  ) AND code = 'EC101'
);
