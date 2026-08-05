-- Sync Faculty Class Assignments to Timetables
-- Run this in the Supabase SQL Editor

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION sync_faculty_assignment_to_timetable()
RETURNS TRIGGER AS $$
DECLARE
    v_day_num INT;
BEGIN
    -- Map string day to number
    CASE NEW.day_of_week
        WHEN 'Monday' THEN v_day_num := 1;
        WHEN 'Tuesday' THEN v_day_num := 2;
        WHEN 'Wednesday' THEN v_day_num := 3;
        WHEN 'Thursday' THEN v_day_num := 4;
        WHEN 'Friday' THEN v_day_num := 5;
        WHEN 'Saturday' THEN v_day_num := 6;
        WHEN 'Sunday' THEN v_day_num := 0;
        ELSE v_day_num := NULL;
    END CASE;

    IF TG_OP = 'INSERT' THEN
        IF NEW.day_of_week IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
            INSERT INTO public.timetables (id, section_id, subject_id, faculty_id, day_of_week, start_time, end_time, room_number)
            VALUES (NEW.id, NEW.section_id, NEW.subject_id, NEW.faculty_profile_id, v_day_num, NEW.start_time, NEW.end_time, NEW.room_number);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If schedule removed or status is completed
        IF NEW.day_of_week IS NULL OR NEW.start_time IS NULL OR NEW.end_time IS NULL OR NEW.status = 'Completed' THEN
            DELETE FROM public.timetables WHERE id = NEW.id;
        ELSE
            -- Upsert
            INSERT INTO public.timetables (id, section_id, subject_id, faculty_id, day_of_week, start_time, end_time, room_number)
            VALUES (NEW.id, NEW.section_id, NEW.subject_id, NEW.faculty_profile_id, v_day_num, NEW.start_time, NEW.end_time, NEW.room_number)
            ON CONFLICT (id) DO UPDATE SET
                section_id = EXCLUDED.section_id,
                subject_id = EXCLUDED.subject_id,
                faculty_id = EXCLUDED.faculty_id,
                day_of_week = EXCLUDED.day_of_week,
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                room_number = EXCLUDED.room_number;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.timetables WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop the trigger if it already exists to prevent duplication
DROP TRIGGER IF EXISTS trigger_sync_faculty_assignment ON public.faculty_class_assignments;

-- 3. Create the trigger
CREATE TRIGGER trigger_sync_faculty_assignment
AFTER INSERT OR UPDATE OR DELETE ON public.faculty_class_assignments
FOR EACH ROW EXECUTE FUNCTION sync_faculty_assignment_to_timetable();

-- 4. Sync existing assignments to the timetable
INSERT INTO public.timetables (id, section_id, subject_id, faculty_id, day_of_week, start_time, end_time, room_number)
SELECT 
    id, 
    section_id, 
    subject_id, 
    faculty_profile_id, 
    CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 0
    END, 
    start_time, 
    end_time, 
    room_number
FROM public.faculty_class_assignments
WHERE day_of_week IS NOT NULL 
  AND start_time IS NOT NULL 
  AND end_time IS NOT NULL 
  AND status != 'Completed'
ON CONFLICT (id) DO NOTHING;
