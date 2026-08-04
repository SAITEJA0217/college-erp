"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDepartmentKPIs(departmentId: string) {
  const supabase = await createClient();

  const [
    { count: facultyCount },
    { count: studentCount },
    { count: assignmentCount }
  ] = await Promise.all([
    supabase.from("faculty").select("*", { count: "exact", head: true }).eq("department_id", departmentId),
    (supabase as any).from("students").select("*", { count: "exact", head: true }).eq("department_id", departmentId),
    (supabase as any).from("assignments").select("*, subjects!inner(department_id)", { count: "exact", head: true }).eq("subjects.department_id", departmentId)
  ]);

  // Avg Attendance
  const { data: attendanceData } = await (supabase as any)
    .from("attendance_records")
    .select("status, timetable_entries!inner(subjects!inner(department_id))")
    .eq("timetable_entries.subjects.department_id", departmentId);

  let avgAttendance = 0;
  if (attendanceData && attendanceData.length > 0) {
    const present = attendanceData.filter((a: any) => a.status === "present").length;
    avgAttendance = Math.round((present / attendanceData.length) * 100);
  }

  return {
    facultyCount: facultyCount || 0,
    studentCount: studentCount || 0,
    avgAttendance,
    assignmentCount: assignmentCount || 0,
  };
}

export async function getAttendanceTrends(departmentId: string) {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("attendance_records")
    .select("date, status, timetable_entries!inner(subjects!inner(department_id))")
    .eq("timetable_entries.subjects.department_id", departmentId)
    .order("date", { ascending: true });

  if (error || !data) return { data: [], error };

  const grouped = data.reduce((acc: any, row: any) => {
    if (!acc[row.date]) acc[row.date] = { date: row.date, present: 0, total: 0 };
    acc[row.date].total += 1;
    if (row.status === "present") acc[row.date].present += 1;
    return acc;
  }, {});

  const trends = Object.values(grouped).map((g: any) => ({
    date: g.date,
    attendance: Math.round((g.present / g.total) * 100)
  }));

  return { data: trends.slice(-14), error: null };
}

export async function getDepartmentAnnouncements(departmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return { data: data || [], error };
}

export async function getFacultyAnalytics(departmentId: string) {
  const supabase = await createClient();

  // Faculty with their assigned subjects
  const { data: facultyList } = await (supabase as any)
    .from("faculty")
    .select(`
      id,
      profiles ( full_name ),
      faculty_subject_assignments (
        id,
        subjects ( name )
      )
    `)
    .eq("department_id", departmentId);

  const facultyWorkload = facultyList?.map((f: any) => ({
    name: f.profiles?.full_name?.split(" ")[0] || "Faculty",
    subjects: f.faculty_subject_assignments?.length || 0
  })) || [];

  return { facultyWorkload };
}

export async function getStudentPerformanceAnalytics(departmentId: string) {
  const supabase = await createClient();

  // Section-wise attendance aggregation
  const { data: sections } = await (supabase as any)
    .from("sections")
    .select(`
      name,
      semesters!inner (
        programs!inner ( departments!inner ( id ) )
      ),
      students ( profile_id )
    `)
    .eq("semesters.programs.departments.id", departmentId);

  // Assignment submissions by section (proxy for performance)
  const { data: submissions } = await (supabase as any)
    .from("assignment_submissions")
    .select(`
      marks_obtained,
      students!inner (
        department_id
      )
    `)
    .eq("students.department_id", departmentId)
    .not("marks_obtained", "is", null);

  const avgMarks = submissions && submissions.length > 0
    ? Math.round(submissions.reduce((s: number, r: any) => s + (r.marks_obtained || 0), 0) / submissions.length)
    : 0;

  const sectionData = sections?.map((s: any) => ({
    name: s.name,
    students: s.students?.length || 0
  })) || [];

  return { sectionData, avgMarks };
}
