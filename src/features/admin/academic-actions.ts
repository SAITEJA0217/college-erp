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

const sectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required").max(10),
  program_id: z.string().uuid("Invalid program reference"),
  academic_year_id: z.string().uuid("Invalid academic year reference"),
});

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required").max(100),
  code: z.string().trim().toUpperCase().min(1, "Subject code is required").max(10),
  credits: z.number().int().min(1).max(6),
  department_id: z.string().uuid("Invalid department reference").optional().nullable(),
});

const facultyAssignmentSchema = z.object({
  faculty_id: z.string().uuid("Invalid faculty reference"),
  subject_id: z.string().uuid("Invalid subject reference"),
  section_id: z.string().uuid("Invalid section reference"),
});

// Helper for user-friendly database errors
function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This record already exists. Please use a unique value.";
  if (err.code === "23503") return "This record is linked to other data and cannot be modified.";
  if (err.code === "23514") return "The provided data is invalid (constraint violation).";
  if (err.code === "42501") return "You do not have permission to perform this action.";
  return err.message || "An unexpected database error occurred.";
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

export async function deleteSection(id: string) {
  try {
    await assertRole(["admin"]);
    const supabase = createAdminClient();
    const { error } = await supabase.from("sections")
      .delete()
      .eq("id", id);
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

export async function deleteSubject(id: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(id);
    const supabase = createAdminClient();
    const { error } = await supabase.from("subjects")
      .delete()
      .eq("id", id);
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

import { createFaculty } from "@/features/admin/user-actions";
import { createFacultyAssignment as createClassAssignment } from "@/features/admin/allocation-actions";

export type SetupWizardPayload = {
  school: { mode: "select" | "new"; id?: string; values?: any };
  department: { mode: "select" | "new"; id?: string; values?: any };
  program: { mode: "select" | "new"; id?: string; values?: any };
  academic_year: { mode: "select" | "new"; id?: string; values?: any };
  section: { mode: "select" | "new"; id?: string; values?: any };
  subject: { mode: "select" | "new"; id?: string; values?: any };
  faculty: { mode: "select" | "new"; id?: string; values?: any };
  timetable: { day_of_week: string; start_time: string; end_time: string; room_number?: string };
};

export async function submitSetupWizard(payload: SetupWizardPayload) {
  await assertRole(["admin"]);
  const supabase = createAdminClient();
  
  const created = {
    schools: [] as string[],
    departments: [] as string[],
    programs: [] as string[],
    academic_years: [] as string[],
    sections: [] as string[],
    subjects: [] as string[],
    profiles: [] as string[],
    faculty_class_assignments: [] as string[],
  };

  const rollback = async () => {
    for (const id of created.faculty_class_assignments) await supabase.from("faculty_class_assignments").delete().eq("id", id);
    for (const id of created.subjects) await supabase.from("subjects").delete().eq("id", id);
    for (const id of created.sections) await supabase.from("sections").delete().eq("id", id);
    for (const id of created.academic_years) await supabase.from("academic_years").delete().eq("id", id);
    for (const id of created.programs) await supabase.from("programs").delete().eq("id", id);
    for (const id of created.departments) await supabase.from("departments").delete().eq("id", id);
    for (const id of created.schools) await supabase.from("schools").delete().eq("id", id);
    for (const id of created.profiles) await supabase.auth.admin.deleteUser(id);
  };

  try {
    let schoolId = payload.school.id;
    if (payload.school.mode === "new") {
      const res = await createSchool(payload.school.values);
      if (res.error || !(res as any).data) throw new Error("School Error: " + res.error);
      schoolId = (res as any).data.id;
      created.schools.push(schoolId as string);
    }

    let departmentId = payload.department.id;
    if (payload.department.mode === "new") {
      const res = await createDepartment({ ...payload.department.values, school_id: schoolId });
      if (res.error || !(res as any).data) throw new Error("Department Error: " + res.error);
      departmentId = (res as any).data.id;
      created.departments.push(departmentId as string);
    }

    let programId = payload.program.id;
    if (payload.program.mode === "new") {
      const res = await createProgram({ ...payload.program.values, department_id: departmentId });
      if (res.error || !(res as any).data) throw new Error("Program Error: " + res.error);
      programId = (res as any).data.id;
      created.programs.push(programId as string);
    }

    let academicYearId = payload.academic_year.id;
    if (payload.academic_year.mode === "new") {
      const res = await createAcademicYear(payload.academic_year.values);
      if (res.error || !(res as any).data) throw new Error("Academic Year Error: " + res.error);
      academicYearId = (res as any).data.id;
      created.academic_years.push(academicYearId as string);
    }

    let sectionId = payload.section.id;
    if (payload.section.mode === "new") {
      const res = await createSection({ ...payload.section.values, program_id: programId, academic_year_id: academicYearId });
      if (res.error || !(res as any).data) throw new Error("Section Error: " + res.error);
      sectionId = (res as any).data.id;
      created.sections.push(sectionId as string);
    }

    let subjectId = payload.subject.id;
    if (payload.subject.mode === "new") {
      const res = await createSubject({ ...payload.subject.values, department_id: departmentId });
      if (res.error || !(res as any).data) throw new Error("Subject Error: " + res.error);
      subjectId = (res as any).data.id;
      created.subjects.push(subjectId as string);
    }

    let facultyProfileId = payload.faculty.id;
    if (payload.faculty.mode === "new") {
      const res = await createFaculty({ ...payload.faculty.values, department_id: departmentId });
      if (res.error) throw new Error("Faculty Error: " + res.error);
      facultyProfileId = res.id;
      created.profiles.push(facultyProfileId as string);
    }

    if (facultyProfileId && subjectId && sectionId) {
      const assignRes = await createClassAssignment({
        faculty_profile_id: facultyProfileId,
        department_id: departmentId,
        section_id: sectionId,
        subject_id: subjectId,
        academic_year: academicYearId,
        room_number: payload.timetable.room_number,
        day_of_week: payload.timetable.day_of_week,
        start_time: payload.timetable.start_time,
        end_time: payload.timetable.end_time,
        status: "Active"
      });
      if (assignRes.error) {
        throw new Error(assignRes.error);
      }
    }

    return { success: true };
  } catch (err: any) {
    await rollback();
    return { error: err.message || "An unexpected error occurred during setup." };
  }
}

export async function cloneAcademicSession(sourceYearId: string, newYearName: string) {
  try {
    const supabase = await createAdminClient();

    // 1. Create the New Academic Year
    const yearStr = newYearName;
    const start_date = `${yearStr.substring(0,4)}-07-01`;
    const end_date = `${yearStr.substring(5,9)}-06-30`;
    
    const yearRes = await createAcademicYear({ name: newYearName, start_date, end_date });
    if (yearRes.error || !(yearRes as any).data) return { error: "Failed to create new academic year: " + yearRes.error };
    
    const newYearId = (yearRes as any).data.id;

    // 2. Fetch all sections from the old year
    const { data: oldSections, error: sectionsError } = await supabase
      .from("sections")
      .select("*")
      .eq("academic_year_id", sourceYearId)
      .eq("is_archived", false);

    if (sectionsError) throw new Error("Failed to fetch old sections.");

    // 3. For each old section, duplicate it to the new year, and duplicate its subjects
    if (oldSections && oldSections.length > 0) {
      for (const section of oldSections as any[]) {
        // Create new section
        const newSecRes = await createSection({
          program_id: section.program_id,
          academic_year_id: newYearId,
          name: section.name
        });
        
        if (newSecRes.error || !(newSecRes as any).data) {
          throw new Error(`Failed to create section ${section.name}: ${newSecRes.error}`);
        }
        
        const newSecId = (newSecRes as any).data.id;

        // Fetch subjects for this old section
        const { data: oldSubjects } = await supabase
          .from("subjects")
          .select("*")
          .eq("section_id", section.id)
          .eq("is_archived", false);

        if (oldSubjects && oldSubjects.length > 0) {
          for (const subject of oldSubjects as any[]) {
            await createSubject({
              section_id: newSecId,
              code: subject.code,
              name: subject.name,
              credits: subject.credits
            });
          }
        }
      }
    }

    return { success: true, newYearId };

  } catch (error: any) {
    return { error: error.message };
  }
}
