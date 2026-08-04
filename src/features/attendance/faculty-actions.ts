"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "@/features/auth/user";

// Fetch assigned subjects for a faculty to populate dropdowns
export async function getAssignedSubjects() {
  try {
    const profile = await getUserProfile();
    if (!profile || profile.role !== "faculty") {
      return { error: "Unauthorized" };
    }

    const supabase = await createClient();

    const { data: assignments, error } = await (supabase as any)
      .from("faculty_assignments")
      .select(`
        subject_id,
        subjects (
          id,
          name,
          code,
          section_id,
          sections (
            id,
            name,
            semester_id,
            semesters (
              id,
              semester_number,
              program_id,
              programs (
                id,
                name,
                department_id,
                departments (
                  id,
                  name
                )
              )
            )
          )
        )
      `)
      .eq("faculty_id", profile.id)
      .eq("is_archived", false);

    if (error) {
      console.error("Error fetching assignments:", error);
      return { error: error.message };
    }

    // Flatten data for easier UI consumption
    const formatted = assignments.map((a: any) => ({
      subject_id: a.subjects.id,
      subject_name: a.subjects.name,
      subject_code: a.subjects.code,
      section_id: a.subjects.sections.id,
      section_name: a.subjects.sections.name,
      semester_id: a.subjects.sections.semesters.id,
      semester_number: a.subjects.sections.semesters.semester_number,
      program_id: a.subjects.sections.semesters.programs.id,
      program_name: a.subjects.sections.semesters.programs.name,
      department_id: a.subjects.sections.semesters.programs.departments.id,
      department_name: a.subjects.sections.semesters.programs.departments.name,
    }));

    return { data: formatted };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch subjects" };
  }
}

// Fetch students for a specific section
export async function getStudentsForSection(sectionId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("students")
      .select(`
        profile_id,
        roll_number,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("section_id", sectionId)
      .order("roll_number");

    if (error) {
      console.error("Error fetching students:", error);
      return { error: error.message };
    }

    return { data };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch students" };
  }
}

// Fetch attendance record for a date
export async function getAttendanceRecord(sectionId: string, subjectId: string, date: string) {
  try {
    const supabase = await createClient();

    const { data: attendance, error } = await (supabase as any)
      .from("attendance")
      .select(`
        id,
        attendance_records (
          student_id,
          status
        )
      `)
      .eq("section_id", sectionId)
      .eq("subject_id", subjectId)
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is fine
      console.error("Error fetching attendance:", error);
      return { error: error.message };
    }

    return { data: attendance };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch attendance record" };
  }
}

// Save attendance record
export async function saveAttendanceRecord(
  sectionId: string,
  subjectId: string,
  date: string,
  records: { student_id: string; status: "present" | "absent" | "late" }[]
) {
  try {
    const profile = await getUserProfile();
    if (!profile || profile.role !== "faculty") {
      return { error: "Unauthorized" };
    }

    const supabase = await createClient();

    // 1. Check if attendance already exists
    const { data: existing } = await (supabase as any)
      .from("attendance")
      .select("id")
      .eq("section_id", sectionId)
      .eq("subject_id", subjectId)
      .eq("date", date)
      .single();

    let attendanceId = existing?.id;

    // 2. If not, create it
    if (!attendanceId) {
      const { data: newAttendance, error: createError } = await (supabase as any)
        .from("attendance")
        .insert({
          section_id: sectionId,
          subject_id: subjectId,
          date: date,
          faculty_id: profile.id,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating attendance session:", createError);
        return { error: createError.message };
      }
      attendanceId = newAttendance.id;
    }

    // 3. Upsert records
    const recordsToInsert = records.map((r) => ({
      attendance_id: attendanceId,
      student_id: r.student_id,
      status: r.status,
    }));

    const { error: upsertError } = await (supabase as any)
      .from("attendance_records")
      .upsert(recordsToInsert, { onConflict: "attendance_id, student_id" });

    if (upsertError) {
      console.error("Error upserting attendance records:", upsertError);
      return { error: upsertError.message };
    }

    revalidatePath("/faculty/attendance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to save attendance" };
  }
}
