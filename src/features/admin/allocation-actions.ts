"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const allocationSchema = z.object({
  faculty_profile_id: z.string().uuid("Invalid faculty reference"),
  department_id: z.string().uuid("Invalid department reference"),
  semester_id: z.string().uuid("Invalid semester reference"),
  section_id: z.string().uuid("Invalid section reference"),
  subject_id: z.string().uuid("Invalid subject reference"),
  academic_year: z.string().min(1, "Academic year is required"),
  room_number: z.string().trim().max(20).optional().nullable(),
  day_of_week: z.string().trim().max(20).optional().nullable(),
  start_time: z.string().trim().optional().nullable(),
  end_time: z.string().trim().optional().nullable(),
  status: z.enum(["Active", "Completed"]),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This specific class assignment already exists.";
  if (err.code === "23503") return "Invalid related reference keys.";
  return err.message || "A database error occurred.";
}

export async function getFacultyAssignments() {
  try {
    await assertRole(["admin"]);
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("faculty_class_assignments")
      .select(`
        *,
        faculty:profiles(
          id,
          full_name,
          employee_or_student_id
        ),
        department:departments(id, name, code),
        semester:semesters(id, semester_number),
        section:sections(id, name),
        subject:subjects(id, name, code)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Failed to load faculty assignments" };
  }
}

export async function getFacultyAssignmentById(id: string) {
  try {
    await assertRole(["admin"]);
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("faculty_class_assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Failed to load assignment" };
  }
}

export async function createFacultyAssignment(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = allocationSchema.parse(values);
    const adminClient = createAdminClient();

    // 1. Prevent exact duplicate assignment (Same Faculty, Semester, Section, Subject)
    const { data: duplicates } = (await adminClient
      .from("faculty_class_assignments")
      .select("id")
      .eq("faculty_profile_id", validated.faculty_profile_id)
      .eq("semester_id", validated.semester_id)
      .eq("section_id", validated.section_id)
      .eq("subject_id", validated.subject_id)
      .limit(1)) as { data: any[] | null };

    if (duplicates && duplicates.length > 0) {
      return { error: "This faculty member is already assigned to this subject and section." };
    }

    // 2. Prevent timetable conflict (Same room/slot or same faculty/slot or same section/slot)
    if (validated.day_of_week && validated.start_time && validated.end_time) {
      const { data: conflicts } = (await adminClient
        .from("faculty_class_assignments")
        .select("id, faculty_profile_id, room_number, section_id")
        .eq("day_of_week", validated.day_of_week)
        .eq("academic_year", validated.academic_year)
        .neq("status", "Completed")
        .or(
          `and(start_time.lt.${validated.end_time},end_time.gt.${validated.start_time})`
        )) as { data: any[] | null };

      if (conflicts && conflicts.length > 0) {
        for (const conflict of conflicts) {
          if (conflict.faculty_profile_id === validated.faculty_profile_id) {
            return { error: "Timetable conflict: The faculty member is already scheduled during this time." };
          }
          if (conflict.section_id === validated.section_id) {
            return { error: "Timetable conflict: The section already has a class scheduled during this time." };
          }
          if (validated.room_number && conflict.room_number === validated.room_number) {
            return { error: `Timetable conflict: Room ${validated.room_number} is already occupied during this time.` };
          }
        }
      }
    }

    const { error } = await adminClient
      .from("faculty_class_assignments")
      .insert([validated] as any);

    if (error) throw error;

    revalidatePath("/admin/faculty-class-allocations");
    revalidatePath("/faculty/classes");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateFacultyAssignment(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = allocationSchema.partial().parse(values);
    const adminClient = createAdminClient();

    // Basic check for time conflict if updating time/room
    if (validated.day_of_week && validated.start_time && validated.end_time && validated.academic_year) {
      const { data: conflicts } = (await adminClient
        .from("faculty_class_assignments")
        .select("id, faculty_profile_id, room_number, section_id")
        .eq("day_of_week", validated.day_of_week)
        .eq("academic_year", validated.academic_year)
        .neq("status", "Completed")
        .neq("id", id) // Exclude current
        .or(
          `and(start_time.lt.${validated.end_time},end_time.gt.${validated.start_time})`
        )) as { data: any[] | null };

      if (conflicts && conflicts.length > 0) {
        for (const conflict of conflicts) {
          if (validated.faculty_profile_id && conflict.faculty_profile_id === validated.faculty_profile_id) {
            return { error: "Timetable conflict: The faculty member is already scheduled during this time." };
          }
          if (validated.section_id && conflict.section_id === validated.section_id) {
            return { error: "Timetable conflict: The section already has a class scheduled during this time." };
          }
          if (validated.room_number && conflict.room_number === validated.room_number) {
            return { error: `Timetable conflict: Room ${validated.room_number} is already occupied during this time.` };
          }
        }
      }
    }

    const { error } = await adminClient
      .from("faculty_class_assignments")
      // @ts-expect-error Type inference limitation
      .update(validated as any)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/faculty-class-allocations");
    revalidatePath("/faculty/classes");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteFacultyAssignment(id: string) {
  try {
    await assertRole(["admin"]);
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("faculty_class_assignments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/faculty-class-allocations");
    revalidatePath("/faculty/classes");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}
