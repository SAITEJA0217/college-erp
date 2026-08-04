-- ============================================================
-- Migration 0009: Performance Indexes
-- ============================================================
-- These indexes cover the most-queried foreign key columns
-- and filter columns across the entire application.

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active) WHERE is_active = true;

-- students
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section_id);
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester_id);

-- faculty
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department_id);

-- faculty_assignments
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty ON faculty_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_subject ON faculty_assignments(subject_id);

-- timetables
CREATE INDEX IF NOT EXISTS idx_timetables_section ON timetables(section_id);
CREATE INDEX IF NOT EXISTS idx_timetables_faculty ON timetables(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetables_day ON timetables(day_of_week);

-- attendance
CREATE INDEX IF NOT EXISTS idx_attendance_timetable ON attendance(timetable_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- attendance_records
CREATE INDEX IF NOT EXISTS idx_attendance_records_attendance ON attendance_records(attendance_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

-- assignments
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_faculty ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_archived ON assignments(is_archived) WHERE is_archived = false;

-- assignment_submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);

-- notes
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_faculty ON notes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(is_archived) WHERE is_archived = false;

-- placements
CREATE INDEX IF NOT EXISTS idx_placements_deadline ON placements(application_deadline);
CREATE INDEX IF NOT EXISTS idx_placements_archived ON placements(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_placements_type ON placements(placement_type);

-- placement_applications
CREATE INDEX IF NOT EXISTS idx_placement_apps_placement ON placement_applications(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_apps_student ON placement_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_apps_status ON placement_applications(status);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
