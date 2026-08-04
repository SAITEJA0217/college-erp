-- Add notification preferences to profiles
ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"academic": true, "placement": true, "general": true, "emergency": true}'::jsonb;

-- Enable Realtime for notifications
-- (Normally you do this in the dashboard or via: )
alter publication supabase_realtime add table notifications;

-- Example of pg_cron for Assignments Due Tomorrow
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- SELECT cron.schedule(
--   'check-assignments-due-tomorrow',
--   '0 8 * * *', -- Run every day at 8 AM
--   $$
--   INSERT INTO notifications (user_id, title, body, category, link)
--   SELECT 
--     s.profile_id,
--     'Assignment Due Tomorrow: ' || a.title,
--     'Don''t forget to submit your assignment!',
--     'academic',
--     '/student/assignments'
--   FROM assignments a
--   JOIN faculty_assignments fa ON a.subject_id = fa.subject_id
--   JOIN timetables t ON t.subject_id = a.subject_id
--   JOIN students s ON s.section_id = t.section_id
--   WHERE a.deadline::date = (CURRENT_DATE + INTERVAL '1 day')::date
--   AND NOT EXISTS (
--       SELECT 1 FROM assignment_submissions sub 
--       WHERE sub.assignment_id = a.id AND sub.student_id = s.profile_id
--   )
--   ON CONFLICT DO NOTHING;
--   $$
-- );
