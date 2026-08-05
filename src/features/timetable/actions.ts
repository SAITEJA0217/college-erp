"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

export async function getTimetableForSection(sectionId: string) {
  try {
    await assertRole(["student", "faculty", "hod", "admin"]);
    z.string().uuid().parse(sectionId);

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("faculty_class_assignments")
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        subject:subjects (
          name,
          code
        ),
        faculty:faculty_profile_id (
          profiles (
            full_name
          )
        ),
        section:sections (
          name
        )
      `)
      .eq("section_id", sectionId)
      .eq("is_archived", false)
      .neq("day_of_week", null)
      .neq("start_time", null)
      .neq("end_time", null);

    if (error) throw error;

    const mapped = (data as any[]).map(t => ({
      id: t.id,
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      room_number: t.room_number,
      subject_name: t.subject?.name || "Unknown",
      subject_code: t.subject?.code || "N/A",
      faculty_name: t.faculty?.profiles?.full_name || "Unknown",
      section_name: t.section?.name || "Unknown",
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message || "Failed to load section timetable" };
  }
}

export async function getTimetableForFaculty(facultyProfileId: string) {
  try {
    const profile = await assertRole(["faculty", "admin"]);
    z.string().uuid().parse(facultyProfileId);

    if (profile.role === "faculty" && profile.id !== facultyProfileId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("faculty_class_assignments")
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        subject:subjects (
          name,
          code
        ),
        section:sections (
          name
        )
      `)
      .eq("faculty_profile_id", facultyProfileId)
      .eq("is_archived", false)
      .neq("day_of_week", null)
      .neq("start_time", null)
      .neq("end_time", null);

    if (error) throw error;

    const mapped = (data as any[]).map(t => ({
      id: t.id,
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      room_number: t.room_number,
      subject_name: t.subject?.name || "Unknown",
      subject_code: t.subject?.code || "N/A",
      faculty_name: "Me",
      section_name: t.section?.name || "Unknown",
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message || "Failed to load faculty timetable" };
  }
}

export async function getStudentTimetable(studentProfileId: string) {
  try {
    const profile = await assertRole(["student", "faculty", "admin"]);
    z.string().uuid().parse(studentProfileId);

    if (profile.role === "student" && profile.id !== studentProfileId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    
    // Get student section
    const { data: studentRecord, error: profErr } = await (supabase as any)
      .from("students")
      .select("section_id")
      .eq("profile_id", studentProfileId)
      .single();
      
    if (profErr || !studentRecord?.section_id) return { error: "No section assigned" };
    
    return await getTimetableForSection(studentRecord.section_id);
  } catch (error: any) {
    return { error: error.message || "Failed to load student timetable" };
  }
}
