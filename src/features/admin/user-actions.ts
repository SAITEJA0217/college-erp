"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_PASSWORD } from "@/constants/auth";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const studentSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().max(15).optional().nullable(),
  roll_number: z.string().trim().min(1, "Roll number is required").max(20),
  department_id: z.string().uuid("Invalid department reference"),
  semester_id: z.string().uuid("Invalid semester reference"),
  section_id: z.string().uuid("Invalid section reference"),
  batch_year: z.number().int().min(2000).max(2100),
});

const facultySchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().max(15).optional().nullable(),
  department_id: z.string().uuid("Invalid department reference"),
  designation: z.string().trim().min(1, "Designation is required").max(50),
  qualification: z.string().trim().min(1, "Qualification is required").max(100),
  specialization: z.string().trim().max(100).optional().nullable(),
  experience_years: z.number().int().min(0).max(50),
  joining_date: z.string().min(1, "Joining date is required"),
  employment_type: z.string().trim().min(1, "Employment type is required").max(50),
  is_active: z.boolean().optional(),
  is_hod: z.boolean().default(false),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "A user with this unique identifier (email or roll/employee ID) already exists.";
  if (err.code === "23503") return "Invalid department, semester, or section reference.";
  return err.message || "A database error occurred during save.";
}

export async function createStudent(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = studentSchema.parse(values);
    const adminAuthClient = createAdminClient();
    
    // 1. Create Auth User
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: validated.email,
      password: DEFAULT_PASSWORD, // Default password
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create authentication account.");
    }

    const userId = authData.user.id;

    // 2. Create Profile
    const { error: profileError } = await adminAuthClient
      .from("profiles")
      // @ts-expect-error type inference limitation
      .insert([{
        id: userId,
        email: validated.email,
        full_name: validated.full_name,
        phone: validated.phone || null,
        role: "student",
        employee_or_student_id: validated.roll_number,
        is_active: true,
        is_archived: false,
      }]);

    if (profileError) {
      await adminAuthClient.auth.admin.deleteUser(userId); // rollback
      throw profileError;
    }

    // 3. Create Student record
    const { error: studentError } = await adminAuthClient
      .from("students")
      // @ts-expect-error type inference limitation
      .insert([{
        profile_id: userId,
        roll_number: validated.roll_number,
        department_id: validated.department_id,
        semester_id: validated.semester_id,
        section_id: validated.section_id,
        batch_year: validated.batch_year,
      }]);

    if (studentError) {
      await adminAuthClient.auth.admin.deleteUser(userId); // rollback
      throw studentError;
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function getStudents() {
  try {
    await assertRole(["admin"]);
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        is_active,
        students!inner(
          roll_number,
          batch_year,
          department:departments(id, name, code),
          semester:semesters(id, semester_number),
          section:sections(id, name)
        )
      `)
      .eq("role", "student")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as any;
  } catch (err) {
    return [];
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(userId);
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      // @ts-expect-error type inference limitation
      .update({ is_active: !currentStatus })
      .eq("id", userId);
      
    if (error) throw error;
    revalidatePath("/admin/students");
    revalidatePath("/admin/faculty");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(userId);
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
    revalidatePath("/admin/students");
    revalidatePath("/admin/faculty");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function resetUserPassword(userId: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(userId);
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password: DEFAULT_PASSWORD
    });
    if (error) throw error;

    const { error: profileError } = await adminClient
      .from("profiles")
      // @ts-expect-error local schema not updated
      .update({ must_change_password: true })
      .eq("id", userId);

    if (profileError) throw profileError;
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function createFaculty(values: any) {
  try {
    await assertRole(["admin"]);
    const validated = facultySchema.parse(values);
    const adminAuthClient = createAdminClient();

    // Auto-generate employee_id via database RPC
    const { data, error: rpcError } = await adminAuthClient.rpc(
      "generate_employee_id",
      { role_name: "faculty" } as any
    );

    if (rpcError || !data) {
      throw new Error("Failed to generate employee ID: " + (rpcError?.message || "Unknown database issue"));
    }

    const employee_id = data as string;

    // 1. Create Auth User
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: validated.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create authentication account.");
    }

    const userId = authData.user.id;

    // 2. Create Profile
    const { error: profileError } = await adminAuthClient
      .from("profiles")
      // @ts-expect-error type inference limitation
      .insert([{
        id: userId,
        email: validated.email,
        full_name: validated.full_name,
        phone: validated.phone || null,
        role: "faculty",
        employee_or_student_id: employee_id,
        is_active: true,
        is_archived: false,
      }]);

    if (profileError) {
      await adminAuthClient.auth.admin.deleteUser(userId);
      throw profileError;
    }

    // 3. Create Faculty record
    const { error: facultyError } = await adminAuthClient
      .from("faculty")
      // @ts-expect-error type inference limitation
      .insert([{
        profile_id: userId,
        department_id: validated.department_id,
        designation: validated.designation,
        qualification: validated.qualification,
        specialization: validated.specialization || null,
        experience_years: validated.experience_years,
        joining_date: validated.joining_date,
        employment_type: validated.employment_type,
        is_hod: validated.is_hod,
      }]);

    if (facultyError) {
      await adminAuthClient.auth.admin.deleteUser(userId);
      throw facultyError;
    }

    revalidatePath("/admin/faculty");
    return { success: true, employee_id };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function getFaculty() {
  try {
    await assertRole(["admin"]);
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("faculty")
      .select(`
        profile_id,
        department_id,
        designation,
        qualification,
        specialization,
        experience_years,
        joining_date,
        employment_type,
        is_hod,
        department:departments(id, name, code),
        profiles(id, email, full_name, phone, is_active, is_archived, employee_or_student_id)
      `)
      .order("profile_id", { ascending: false });

    // Fallback if extended columns don't exist yet
    if (error && (error.code === "42703" || error.message?.includes("does not exist"))) {
      const { data: baseData, error: baseError } = await adminClient
        .from("faculty")
        .select(`
          profile_id,
          department_id,
          designation,
          department:departments(id, name, code),
          profiles(id, email, full_name, phone, is_active, is_archived, employee_or_student_id)
        `);
      if (baseError) throw baseError;
      return (baseData || []).filter((f: any) => !f.profiles?.is_archived).map((f: any) => ({
        id: f.profiles?.id || f.profile_id,
        email: f.profiles?.email,
        full_name: f.profiles?.full_name,
        phone: f.profiles?.phone,
        is_active: f.profiles?.is_active,
        employee_or_student_id: f.profiles?.employee_or_student_id,
        faculty: {
          designation: f.designation,
          qualification: null,
          specialization: null,
          experience_years: null,
          joining_date: null,
          employment_type: null,
          is_hod: false,
          department: f.department,
        },
      })) as any;
    }

    if (error) throw error;

    return (data || []).filter((f: any) => !f.profiles?.is_archived).map((f: any) => ({
      id: f.profiles?.id || f.profile_id,
      email: f.profiles?.email,
      full_name: f.profiles?.full_name,
      phone: f.profiles?.phone,
      is_active: f.profiles?.is_active,
      employee_or_student_id: f.profiles?.employee_or_student_id,
      faculty: {
        designation: f.designation,
        qualification: f.qualification,
        specialization: f.specialization,
        experience_years: f.experience_years,
        joining_date: f.joining_date,
        employment_type: f.employment_type,
        is_hod: f.is_hod,
        department: f.department,
      },
    })) as any;
  } catch (err) {
    return [];
  }
}

export async function updateFaculty(profileId: string, values: any) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(profileId);
    const validated = facultySchema.partial().parse(values);
    const adminClient = createAdminClient();

    // Update profile (phone, is_active)
    const profileUpdates: Record<string, any> = {};
    if (validated.phone !== undefined) profileUpdates.phone = validated.phone;
    if (validated.is_active !== undefined) profileUpdates.is_active = validated.is_active;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileErr } = await adminClient
        .from("profiles")
        // @ts-expect-error type inference limitation
        .update(profileUpdates)
        .eq("id", profileId);
      if (profileErr) throw profileErr;
    }

    // Update faculty record
    const facultyUpdates: Record<string, any> = {};
    if (validated.department_id !== undefined) facultyUpdates.department_id = validated.department_id;
    if (validated.designation !== undefined) facultyUpdates.designation = validated.designation;
    if (validated.qualification !== undefined) facultyUpdates.qualification = validated.qualification;
    if (validated.specialization !== undefined) facultyUpdates.specialization = validated.specialization;
    if (validated.experience_years !== undefined) facultyUpdates.experience_years = validated.experience_years;
    if (validated.joining_date !== undefined) facultyUpdates.joining_date = validated.joining_date;
    if (validated.employment_type !== undefined) facultyUpdates.employment_type = validated.employment_type;
    if (validated.is_hod !== undefined) facultyUpdates.is_hod = validated.is_hod;

    if (Object.keys(facultyUpdates).length > 0) {
      const { error: facultyErr } = await adminClient
        .from("faculty")
        // @ts-expect-error type inference limitation
        .update(facultyUpdates)
        .eq("profile_id", profileId);
      if (facultyErr) throw facultyErr;
    }

    revalidatePath("/admin/faculty");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteFacultyAccount(userId: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(userId);
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
    revalidatePath("/admin/faculty");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}
