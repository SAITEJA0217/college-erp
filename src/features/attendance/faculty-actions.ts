"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/features/auth/user";
import { sendNotification } from "@/features/notifications/actions";
import { z } from "zod";

const attendanceRecordInputSchema = z.object({
  sectionId: z.string().uuid("Invalid section reference"),
  subjectId: z.string().uuid("Invalid subject reference"),
  date: z.string().min(1, "Date is required"),
  records: z.array(z.object({
    student_id: z.string().uuid("Invalid student reference"),
    status: z.enum(["present", "absent", "late"]),
  })).min(1, "At least one attendance record is required"),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This attendance slot already exists.";
  if (err.code === "23503") return "Invalid section, subject, or student reference key.";
  return err.message || "Failed to save attendance record.";
}

// Fetch assigned subjects for a faculty to populate dropdowns
export async function getAssignedSubjects() {
  try {
    const profile = await assertRole(["faculty"]);
    const supabase = await createClient();

    const { data: assignments, error } = await (supabase as any)
      .from("faculty_class_assignments")
      .select(`
        subject_id,
        subject:subjects (
          id,
          name,
          code
        ),
        section_id,
        section:sections (
          id,
          name,
          semester:semesters (
            id,
            semester_number,
            program:programs (
              id,
              name,
              department:departments (
                id,
                name
              )
            )
          )
        )
      `)
      .eq("faculty_profile_id", profile.id)
      .eq("is_archived", false);

    if (error) throw error;

    // Flatten data for easier UI consumption
    const formatted = (assignments || []).map((a: any) => {
      const sub = a.subject;
      const sec = a.section;
      const sem = sec?.semester;
      const prog = sem?.program;
      const dept = prog?.department;
      return {
        subject_id: sub?.id,
        subject_name: sub?.name,
        subject_code: sub?.code,
        section_id: sec?.id,
        section_name: sec?.name,
        semester_id: sem?.id,
        semester_number: sem?.semester_number,
        program_id: prog?.id,
        program_name: prog?.name,
        department_id: dept?.id,
        department_name: dept?.name,
      };
    });

    return { data: formatted };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch subjects" };
  }
}

// Fetch students for a specific section
export async function getStudentsForSection(sectionId: string) {
  try {
    await assertRole(["faculty"]);
    z.string().uuid().parse(sectionId);
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

    if (error) throw error;

    return { data };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch students" };
  }
}

// Fetch attendance record for a date
export async function getAttendanceRecord(sectionId: string, subjectId: string, date: string) {
  try {
    await assertRole(["faculty"]);
    z.string().uuid().parse(sectionId);
    z.string().uuid().parse(subjectId);
    z.string().min(1).parse(date);
    
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
      throw error;
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
    const profile = await assertRole(["faculty"]);
    const validated = attendanceRecordInputSchema.parse({ sectionId, subjectId, date, records });
    
    // Prevent attendance marking on future dates
    if (new Date(validated.date) > new Date()) {
      return { error: "Cannot mark attendance for future dates." };
    }

    const supabase = await createClient();

    // 1. Check if attendance already exists
    const { data: existing } = await (supabase as any)
      .from("attendance")
      .select("id")
      .eq("section_id", validated.sectionId)
      .eq("subject_id", validated.subjectId)
      .eq("date", validated.date)
      .single();

    let attendanceId = existing?.id;

    // 2. If not, create it
    if (!attendanceId) {
      const { data: newAttendance, error: createError } = await (supabase as any)
        .from("attendance")
        .insert({
          section_id: validated.sectionId,
          subject_id: validated.subjectId,
          date: validated.date,
          faculty_id: profile.id,
        })
        .select("id")
        .single();

      if (createError) throw createError;
      attendanceId = newAttendance.id;
    }

    // 3. Upsert records
    const recordsToInsert = validated.records.map((r) => ({
      attendance_id: attendanceId,
      student_id: r.student_id,
      status: r.status,
    }));

    const { error: upsertError } = await (supabase as any)
      .from("attendance_records")
      .upsert(recordsToInsert, { onConflict: "attendance_id, student_id" });

    if (upsertError) throw upsertError;

    // Notify absent/late students
    try {
      const notifyRecords = validated.records.filter(r => r.status === "absent" || r.status === "late");
      if (notifyRecords.length > 0) {
        const { data: subjectData } = await (supabase as any)
          .from("subjects")
          .select("name")
          .eq("id", validated.subjectId)
          .single();

        const subjectName = (subjectData as any)?.name || "Subject";

        for (const r of notifyRecords) {
          await sendNotification({
            userIds: [r.student_id],
            title: `Attendance Alert: Marked ${r.status.toUpperCase()}`,
            body: `You were marked ${r.status} for ${subjectName} on ${validated.date}.`,
            category: "academic",
            link: "/student/attendance",
          });
        }
      }
    } catch (err) {
      console.error("Failed to send attendance notifications:", err);
    }

    revalidatePath("/faculty/attendance");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}
