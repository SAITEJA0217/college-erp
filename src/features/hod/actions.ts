"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRole } from "@/features/auth/user";

export async function getDepartmentKPIs(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    const [
      { count: facultyCount },
      { count: studentCount },
      { count: assignmentCount }
    ] = await Promise.all([
      supabase.from("faculty").select("*", { count: "exact", head: true }).eq("department_id", departmentId),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("department_id", departmentId),
      supabase.from("assignments").select("*, subjects!inner(department_id)", { count: "exact", head: true }).eq("subjects.department_id", departmentId)
    ]);

    // Avg Attendance: Get attendance records for subjects in this department
    const { data: attendanceData } = await (supabase as any)
      .from("attendance_records")
      .select(`
        status,
        attendance!inner (
          subject:subjects!inner (
            department_id
          )
        )
      `)
      .eq("attendance.subject.department_id", departmentId);

    let avgAttendance = 0;
    if (attendanceData && attendanceData.length > 0) {
      const present = (attendanceData as any[]).filter((a: any) => a.status === "present").length;
      avgAttendance = Math.round((present / attendanceData.length) * 100);
    }

    return {
      facultyCount: facultyCount || 0,
      studentCount: studentCount || 0,
      avgAttendance,
      assignmentCount: assignmentCount || 0,
    };
  } catch (err) {
    return {
      facultyCount: 0,
      studentCount: 0,
      avgAttendance: 0,
      assignmentCount: 0,
    };
  }
}

export async function getAttendanceTrends(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("attendance_records")
      .select(`
        status,
        attendance!inner (
          date,
          subject:subjects!inner (
            department_id
          )
        )
      `)
      .eq("attendance.subject.department_id", departmentId);

    if (error || !data) return [];

    // Group by date
    const dateGroups: Record<string, { present: number; total: number }> = {};
    (data as any[]).forEach((row: any) => {
      const date = row.attendance?.date;
      if (!date) return;
      if (!dateGroups[date]) {
        dateGroups[date] = { present: 0, total: 0 };
      }
      dateGroups[date].total += 1;
      if (row.status === "present") {
        dateGroups[date].present += 1;
      }
    });

    return Object.entries(dateGroups)
      .map(([date, stats]) => ({
        date,
        rate: Math.round((stats.present / stats.total) * 100),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 sessions
  } catch (err) {
    return [];
  }
}

export async function getDepartmentAnnouncements(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("announcements")
      .select("*")
      .or(`department_id.eq.${departmentId},department_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function getFacultyAnalytics(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    const { data: facultyWorkload } = await (supabase as any)
      .from("profiles")
      .select(`
        id,
        full_name,
        faculty!inner ( designation, department_id ),
        faculty_class_assignments ( id )
      `)
      .eq("faculty.department_id", departmentId)
      .eq("role", "faculty")
      .eq("is_archived", false);

    return { facultyWorkload: facultyWorkload || [] };
  } catch (err) {
    return { facultyWorkload: [] };
  }
}

export async function getStudentPerformanceAnalytics(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    // Section-wise student counts
    const { data: sections } = await (supabase as any)
      .from("sections")
      .select(`
        name,
        semester:semesters!inner (
          program:programs!inner (
            department_id
          )
        ),
        students ( profile_id )
      `)
      .eq("semester.program.department_id", departmentId);

    // Assignment submissions by section (proxy for performance)
    const { data: submissions } = await (supabase as any)
      .from("assignment_submissions")
      .select(`
        marks_obtained,
        student:students!inner (
          department_id
        )
      `)
      .eq("student.department_id", departmentId)
      .not("marks_obtained", "is", null);

    const submissionsArray = (submissions || []) as any[];
    const avgMarks = submissionsArray.length > 0
      ? Math.round(submissionsArray.reduce((s: number, r: any) => s + (r.marks_obtained || 0), 0) / submissionsArray.length)
      : 0;

    const sectionData = (sections as any[])?.map((s: any) => ({
      name: s.name,
      students: s.students?.length || 0
    })) || [];

    return { sectionData, avgMarks };
  } catch (err) {
    return { sectionData: [], avgMarks: 0 };
  }
}

export async function getDepartmentFaculty(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        is_active,
        employee_or_student_id,
        faculty!inner (
          designation,
          qualification,
          specialization,
          experience_years,
          joining_date,
          employment_type
        )
      `)
      .eq("faculty.department_id", departmentId)
      .eq("role", "faculty")
      .eq("is_archived", false);

    if (error) throw error;

    return (data || []).map((f: any) => ({
      id: f.id,
      full_name: f.full_name,
      email: f.email,
      phone: f.phone || "—",
      employee_id: f.employee_or_student_id || "—",
      is_active: f.is_active,
      designation: f.faculty?.[0]?.designation || "Assistant Professor",
      qualification: f.faculty?.[0]?.qualification || "—",
      specialization: f.faculty?.[0]?.specialization || "—",
      experience_years: f.faculty?.[0]?.experience_years || 0,
      joining_date: f.faculty?.[0]?.joining_date || "—",
      employment_type: f.faculty?.[0]?.employment_type || "Full Time",
    }));
  } catch (err) {
    return [];
  }
}

export async function getDepartmentStudents(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        is_active,
        students!inner (
          roll_number,
          batch_year,
          current_cgpa,
          credits_completed,
          mentor_name,
          semester:semesters ( semester_number ),
          section:sections ( name )
        )
      `)
      .eq("students.department_id", departmentId)
      .eq("role", "student")
      .eq("is_archived", false);

    if (error) throw error;

    return (data || []).map((s: any) => {
      const student = Array.isArray(s.students) ? s.students[0] : s.students;
      const semesterData = Array.isArray(student?.semester) ? student.semester[0] : student?.semester;
      const sectionData = Array.isArray(student?.section) ? student.section[0] : student?.section;
      return {
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone || "—",
        is_active: s.is_active,
        roll_number: student?.roll_number || "—",
        batch_year: student?.batch_year || "—",
        current_cgpa: student?.current_cgpa || "0.00",
        credits_completed: student?.credits_completed || 0,
        mentor_name: student?.mentor_name || "—",
        semester: semesterData?.semester_number ? `Semester ${semesterData.semester_number}` : "—",
        section: sectionData?.name || "—",
      };
    });
  } catch (err) {
    return [];
  }
}

export async function getDepartmentDetails(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("departments")
      .select(`
        id,
        name,
        code,
        programs (
          id,
          name,
          code,
          semesters (
            id,
            semester_number,
            sections (
              id,
              name
            )
          )
        )
      `)
      .eq("id", departmentId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    return null;
  }
}
