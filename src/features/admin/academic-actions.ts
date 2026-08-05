"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

// Zod Schemas for Validation
const schoolSchema = z.object({
  name: z.string().trim().min(1, "School name is required").max(100),
  code: z.string().trim().toUpperCase().min(1, "School code is required").max(10),
});

const departmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required").max(100),
  code: z.string().trim().toUpperCase().min(1, "Department code is required").max(10),
  school_id: z.string().uuid("Invalid school reference"),
});

const programSchema = z.object({
  name: z.string().trim().min(1, "Program name is required").max(100),
  code: z.string().trim().toUpperCase().min(1, "Program code is required").max(10),
  department_id: z.string().uuid("Invalid department reference"),
  duration: z.coerce.number().int().min(1, "Duration must be at least one year").max(12),
});

const academicYearSchema = z.object({
  name: z.string().trim().min(1, "Academic year name is required").max(20),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

const semesterSchema = z.object({
  semester_number: z.number().int().min(1).max(10),
  program_id: z.string().uuid("Invalid program reference"),
  academic_year_id: z.string().uuid("Invalid academic year reference"),
});

const sectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required").max(10),
  semester_id: z.string().uuid("Invalid semester reference"),
});

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required").max(100),
  code: z.string().trim().toUpperCase().min(1, "Subject code is required").max(10),
  credits: z.number().int().min(1).max(6),
  semester_id: z.string().uuid("Invalid semester reference").optional().nullable(),
  department_id: z.string().uuid("Invalid department reference").optional().nullable(),
});

const facultyAssignmentSchema = z.object({
  faculty_id: z.string().uuid("Invalid faculty reference"),
  subject_id: z.string().uuid("Invalid subject reference"),
  section_id: z.string().uuid("Invalid section reference"),
});

// Helper for user-friendly database errors
function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "Record already exists (unique constraint violation).";
  if (err.code === "23503") return "Invalid foreign reference key.";
  return err.message || "A database error occurred.";
}

// 1. Colleges Actions
export async function getSchools() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("schools").select("*").eq("is_archived", false);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createSchool(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = schoolSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("schools")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/schools");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateSchool(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = schoolSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("schools")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/schools");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveSchool(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("schools")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/schools");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteSchool(id: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(id);
    const supabase = createAdminClient();
    const { error } = await supabase.from("schools")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/schools");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 2. Departments Actions
export async function getDepartments() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("departments")
      .select("*, school:schools(name, code)")
      .eq("is_archived", false);
    // Flatten the parent school relationship for display and dependent forms.
    return (data || []).map((d: any) => ({
      ...d,
      school_name: d.school?.name || "—",
      school_code: d.school?.code || "—",
      school: undefined,
    }));
  } catch (err) {
    return [];
  }
}

export async function createDepartment(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = departmentSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("departments")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/departments");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateDepartment(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = departmentSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("departments")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/departments");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveDepartment(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("departments")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(id);
    const supabase = createAdminClient();
    const { error } = await supabase.from("departments")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 3. Programs Actions
export async function getPrograms() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("programs").select("*, department:departments(name, school:schools(name))").eq("is_archived", false);
    return (data || []).map((program: any) => ({ ...program, department_name: program.department?.name || "—", school_name: program.department?.school?.name || "—", department: undefined }));
  } catch (err) {
    return [];
  }
}

export async function createProgram(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = programSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("programs")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/programs");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateProgram(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = programSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("programs")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/programs");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveProgram(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("programs")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/programs");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 4. Academic Years Actions
export async function getAcademicYears() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("academic_years").select("*").eq("is_archived", false);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createAcademicYear(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = academicYearSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("academic_years")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/academic-years");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateAcademicYear(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = academicYearSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("academic_years")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/academic-years");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveAcademicYear(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("academic_years")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/academic-years");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 5. Semesters Actions
export async function getSemesters() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("semesters").select("*").eq("is_archived", false);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createSemester(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = semesterSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("semesters")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/semesters");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateSemester(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = semesterSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("semesters")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/semesters");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveSemester(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("semesters")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/semesters");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 6. Sections Actions
export async function getSections() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("sections").select("*").eq("is_archived", false);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createSection(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = sectionSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("sections")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/sections");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateSection(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = sectionSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("sections")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/sections");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveSection(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("sections")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/sections");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 7. Subjects Actions
export async function getSubjects() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("subjects").select("*").eq("is_archived", false);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createSubject(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = subjectSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("subjects")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/subjects");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateSubject(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = subjectSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("subjects")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/subjects");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveSubject(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("subjects")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

// 8. Faculty Assignments Actions
export async function getFacultyAssignments() {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { data } = await supabase.from("faculty_assignments").select("*").eq("is_archived", false);
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function createFacultyAssignment(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = facultyAssignmentSchema.parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("faculty_assignments")
      // @ts-expect-error type safety bypass
      .insert([validated]).select().single();
    if (error) throw error;
    revalidatePath("/admin/faculty-assignments");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function updateFacultyAssignment(id: string, values: any) {
  try {
    await assertRole(["admin"]);
    const validated = facultyAssignmentSchema.partial().parse(values);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("faculty_assignments")
      // @ts-expect-error type safety bypass
      .update(validated).eq("id", id).select().single();
    if (error) throw error;
    revalidatePath("/admin/faculty-assignments");
    return { data };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function archiveFacultyAssignment(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("faculty_assignments")
      // @ts-expect-error type safety bypass
      .update({ is_archived: true }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/faculty-assignments");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}
