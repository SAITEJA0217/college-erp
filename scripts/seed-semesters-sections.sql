-- Seed Script for Semesters (1 to 8) and Sections (Alpha to Zeta)
-- Run this script in the Supabase SQL Editor.

DO $$
DECLARE
    v_program RECORD;
    v_academic_year RECORD;
    v_semester RECORD;
    i INT;
    v_section_name TEXT;
    v_sections TEXT[] := ARRAY['Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega', 'Epsilon', 'Zeta'];
    v_semester_id UUID;
BEGIN
    -- 1. Create Semesters 1 to 8 for all active programs and academic years
    FOR v_program IN SELECT id FROM public.programs WHERE is_archived = false LOOP
        FOR v_academic_year IN SELECT id FROM public.academic_years WHERE is_archived = false LOOP
            
            -- Loop through 1 to 8
            FOR i IN 1..8 LOOP
                -- Check if semester already exists
                SELECT id INTO v_semester_id 
                FROM public.semesters 
                WHERE program_id = v_program.id 
                  AND academic_year_id = v_academic_year.id 
                  AND semester_number = i;

                -- If it doesn't exist, insert it
                IF v_semester_id IS NULL THEN
                    INSERT INTO public.semesters (program_id, academic_year_id, semester_number, start_date, end_date)
                    VALUES (v_program.id, v_academic_year.id, i, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months')
                    RETURNING id INTO v_semester_id;
                END IF;
            END LOOP;

        END LOOP;
    END LOOP;

    -- 2. Create Sections Alpha to Zeta for ALL active semesters
    FOR v_semester IN SELECT id FROM public.semesters WHERE is_archived = false LOOP
        FOREACH v_section_name IN ARRAY v_sections
        LOOP
            -- Check if section already exists for this semester
            IF NOT EXISTS (
                SELECT 1 
                FROM public.sections 
                WHERE semester_id = v_semester.id 
                  AND name = v_section_name
            ) THEN
                -- Insert section
                INSERT INTO public.sections (semester_id, name)
                VALUES (v_semester.id, v_section_name);
            END IF;
        END LOOP;
    END LOOP;

END $$;
