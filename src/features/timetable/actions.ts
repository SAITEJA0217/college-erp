"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTimetableForSection(sectionId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("timetables")
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        subjects (
          name,
          code
        ),
        faculty:faculty_id (
          profiles (
            full_name
          )
        )
      `)
      .eq("section_id", sectionId)
      .eq("is_archived", false);

    if (error) throw error;

    const mapped = (data as any[]).map(t => ({
      id: t.id,
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      room_number: t.room_number,
      subject_name: t.subjects?.name || "Unknown",
      subject_code: t.subjects?.code || "N/A",
      faculty_name: t.faculty?.profiles?.full_name || "Unknown",
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTimetableForFaculty(facultyId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("timetables")
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        subjects (
          name,
          code
        ),
        sections (
          name
        )
      `)
      .eq("faculty_id", facultyId)
      .eq("is_archived", false);

    if (error) throw error;

    const mapped = (data as any[]).map(t => ({
      id: t.id,
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      room_number: t.room_number,
      subject_name: t.subjects?.name || "Unknown",
      subject_code: t.subjects?.code || "N/A",
      faculty_name: "Me",
      section_name: t.sections?.name || "Unknown",
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getStudentTimetable(studentId: string) {
  try {
    const supabase = await createClient();
    
    // Get student section
    const { data: profile, error: profErr } = await (supabase as any)
      .from("students")
      .select("section_id")
      .eq("profile_id", studentId)
      .single();
      
    if (profErr || !profile?.section_id) return { error: "No section assigned" };
    
    return await getTimetableForSection(profile.section_id);
  } catch (error: any) {
    return { error: error.message };
  }
}

// Conflict detection logic
export async function createTimetableSlot(data: {
  section_id: string;
  subject_id: string;
  faculty_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Check Faculty Conflict
    // A conflict occurs if there is a class on the same day for this faculty
    // where the existing start_time < new end_time AND existing end_time > new start_time
    const { data: facConflicts, error: facErr } = await (supabase as any)
      .from("timetables")
      .select("id, start_time, end_time, room_number")
      .eq("faculty_id", data.faculty_id)
      .eq("day_of_week", data.day_of_week)
      .eq("is_archived", false);

    if (facErr) throw facErr;

    if (facConflicts && facConflicts.length > 0) {
      const hasConflict = (facConflicts as any[]).some((c: any) => {
        return c.start_time < data.end_time && c.end_time > data.start_time;
      });
      if (hasConflict) {
        return { error: "Conflict: This faculty member is already scheduled to teach during this time slot." };
      }
    }

    // 2. Check Room Conflict
    if (data.room_number) {
      const { data: roomConflicts, error: roomErr } = await (supabase as any)
        .from("timetables")
        .select("id, start_time, end_time")
        .eq("room_number", data.room_number)
        .eq("day_of_week", data.day_of_week)
        .eq("is_archived", false);

      if (roomErr) throw roomErr;

      if (roomConflicts && roomConflicts.length > 0) {
        const hasConflict = (roomConflicts as any[]).some((c: any) => {
          return c.start_time < data.end_time && c.end_time > data.start_time;
        });
        if (hasConflict) {
          return { error: `Conflict: Classroom ${data.room_number} is already occupied during this time slot.` };
        }
      }
    }

    // 3. Check Section Conflict (A section can't have 2 classes at once)
    const { data: secConflicts, error: secErr } = await (supabase as any)
      .from("timetables")
      .select("id, start_time, end_time")
      .eq("section_id", data.section_id)
      .eq("day_of_week", data.day_of_week)
      .eq("is_archived", false);

    if (secErr) throw secErr;

    if (secConflicts && secConflicts.length > 0) {
      const hasConflict = (secConflicts as any[]).some((c: any) => {
        return c.start_time < data.end_time && c.end_time > data.start_time;
      });
      if (hasConflict) {
        return { error: "Conflict: This section already has a class scheduled during this time slot." };
      }
    }

    // Insert
    const { error: insertErr } = await (supabase as any)
      .from("timetables")
      .insert({
        section_id: data.section_id,
        subject_id: data.subject_id,
        faculty_id: data.faculty_id,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        room_number: data.room_number || null,
      });

    if (insertErr) throw insertErr;

    revalidatePath("/admin/timetable");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTimetableSlot(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("timetables")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
    revalidatePath("/admin/timetable");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
