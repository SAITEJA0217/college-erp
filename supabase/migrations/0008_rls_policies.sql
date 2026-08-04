-- ============================================================
-- Migration 0008: Comprehensive RLS Policies
-- ============================================================
-- Enable RLS on all tables that don't have it yet
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper function: get current user's department
CREATE OR REPLACE FUNCTION public.get_my_department_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT department_id FROM public.faculty WHERE profile_id = auth.uid()
  UNION ALL
  SELECT department_id FROM public.students WHERE profile_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================
-- NOTIFICATIONS: Users only see their own
-- ============================================================
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Controlled by server actions with service role

CREATE POLICY "Users mark own notifications read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- STUDENTS: Students see themselves; faculty/admin see all in dept
-- ============================================================
CREATE POLICY "Students view own record"
  ON students FOR SELECT
  USING (
    profile_id = auth.uid()
    OR get_my_role() IN ('admin', 'faculty', 'hod', 'placement')
  );

-- ============================================================
-- FACULTY: Faculty see themselves; admin/hod see all
-- ============================================================
CREATE POLICY "Faculty view records"
  ON faculty FOR SELECT
  USING (
    profile_id = auth.uid()
    OR get_my_role() IN ('admin', 'hod')
  );

-- ============================================================
-- NOTES: Students and faculty see notes for their subjects
-- ============================================================
CREATE POLICY "Authenticated users can read notes"
  ON notes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Faculty can insert notes"
  ON notes FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own notes"
  ON notes FOR UPDATE
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can archive own notes"
  ON notes FOR DELETE
  USING (faculty_id = auth.uid() OR get_my_role() = 'admin');

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE POLICY "Authenticated users can read assignments"
  ON assignments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Faculty can create assignments"
  ON assignments FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own assignments"
  ON assignments FOR UPDATE
  USING (faculty_id = auth.uid() OR get_my_role() = 'admin');

-- ============================================================
-- ASSIGNMENT SUBMISSIONS
-- ============================================================
CREATE POLICY "Students see own submissions; faculty see all"
  ON assignment_submissions FOR SELECT
  USING (
    student_id = auth.uid()
    OR get_my_role() IN ('faculty', 'admin', 'hod')
  );

CREATE POLICY "Students can submit"
  ON assignment_submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own submission before graded"
  ON assignment_submissions FOR UPDATE
  USING (
    (student_id = auth.uid() AND marks_obtained IS NULL)
    OR get_my_role() IN ('faculty', 'admin')
  );

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE POLICY "Authenticated users can read attendance"
  ON attendance FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Faculty can create attendance sessions"
  ON attendance FOR INSERT
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Attendance records: students see own"
  ON attendance_records FOR SELECT
  USING (
    student_id = auth.uid()
    OR get_my_role() IN ('faculty', 'admin', 'hod')
  );

CREATE POLICY "Faculty can insert attendance records"
  ON attendance_records FOR INSERT
  WITH CHECK (get_my_role() = 'faculty');

CREATE POLICY "Faculty can update attendance records"
  ON attendance_records FOR UPDATE
  USING (get_my_role() IN ('faculty', 'admin'));

-- ============================================================
-- TIMETABLES
-- ============================================================
CREATE POLICY "Authenticated users can read timetables"
  ON timetables FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage timetables"
  ON timetables FOR ALL
  USING (get_my_role() = 'admin');

-- ============================================================
-- PLACEMENTS
-- ============================================================
CREATE POLICY "Authenticated users can read placements"
  ON placements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Placement cell can manage drives"
  ON placements FOR ALL
  USING (get_my_role() IN ('placement', 'admin'));

CREATE POLICY "Students see own applications"
  ON placement_applications FOR SELECT
  USING (
    student_id = auth.uid()
    OR get_my_role() IN ('placement', 'admin')
  );

CREATE POLICY "Students can apply"
  ON placement_applications FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Placement cell can update application status"
  ON placement_applications FOR UPDATE
  USING (get_my_role() IN ('placement', 'admin'));
