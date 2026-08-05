"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRole } from "@/features/auth/user";
import { AssignedClass, FacultyProfileInfo } from "./types";

export async function getFacultyProfileInfo(): Promise<FacultyProfileInfo | null> {
  try {
    const profile = await assertRole(["faculty"]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        employee_or_student_id,
        full_name,
        faculty(
          designation,
          department:departments(name)
        )
      `)
      .eq("id", profile.id)
      .maybeSingle() as any;

    if (error || !data) return null;

    const facultyData = Array.isArray(data.faculty) ? data.faculty[0] : data.faculty;
    const deptData = facultyData?.department;
    const deptName = Array.isArray(deptData) ? deptData[0]?.name : (deptData as any)?.name;

    return {
      employee_or_student_id: data.employee_or_student_id || "",
      full_name: data.full_name || "",
      designation: facultyData?.designation || "Faculty",
      department: deptName || "General",
    };
  } catch (err) {
    return null;
  }
}

export async function getAssignedClasses(): Promise<AssignedClass[]> {
  try {
    const profile = await assertRole(["faculty"]);
    const supabase = await createClient();

    // Query new faculty_class_assignments
    const { data, error } = await supabase
      .from("faculty_class_assignments")
      .select(`
        id,
        academic_year,
        room_number,
        day_of_week,
        start_time,
        end_time,
        status,
        subject:subjects(
          id,
          code,
          name,
          credits
        ),
        section:sections(
          id,
          name
        ),
        semester:semesters(
          id,
          semester_number,
          program:programs(
            name
          )
        ),
        department:departments(
          name
        )
      `)
      .eq("faculty_profile_id", profile.id)
      .eq("is_archived", false);

    if (error || !data) {
      console.error("Error fetching assigned classes:", error);
      return [];
    }

    // To get student counts efficiently, we can fetch all students in the relevant sections
    const sectionIds = data.map((fa: any) => fa.section?.id).filter(Boolean);
    
    let sectionCounts: Record<string, number> = {};
    if (sectionIds.length > 0) {
      const { data: studentsData } = await supabase
        .from("students")
        .select("section_id")
        .in("section_id", sectionIds);
        
      if (studentsData) {
        studentsData.forEach((s: any) => {
          if (s.section_id) {
            sectionCounts[s.section_id] = (sectionCounts[s.section_id] || 0) + 1;
          }
        });
      }
    }

    // Map to AssignedClass
    const classes: AssignedClass[] = data.map((item: any) => {
      const subject = item.subject;
      const section = item.section;
      const semester = item.semester;
      const department = item.department;
      const program = semester?.program;

      // Time diff in hours if available
      let weeklyHours = subject?.credits || 0;
      if (item.start_time && item.end_time) {
        const [sh, sm] = item.start_time.split(":");
        const [eh, em] = item.end_time.split(":");
        weeklyHours = Math.abs(parseInt(eh) - parseInt(sh)) + Math.abs(parseInt(em) - parseInt(sm))/60;
      }

      return {
        id: item.id,
        subject_id: subject?.id || "",
        subject_code: subject?.code || "",
        subject_name: subject?.name || "",
        credits: subject?.credits || 0,
        section_id: section?.id || "",
        section_name: section?.name || "",
        semester_id: semester?.id || "",
        semester_number: semester?.semester_number || 0,
        academic_year_name: item.academic_year || "",
        program_name: program?.name || "",
        department_name: department?.name || "",
        weekly_hours: Math.round(weeklyHours * 10) / 10,
        students_count: sectionCounts[section?.id] || 0,
        status: item.status as "Active" | "Upcoming" | "Completed",
      };
    });

    return classes;
  } catch (err) {
    return [];
  }
}
