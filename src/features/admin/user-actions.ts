"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createStudent(values: {
  email: string;
  full_name: string;
  phone?: string;
  roll_number: string;
  department_id: string;
  semester_id: string;
  section_id: string;
  batch_year: number;
}) {
  const adminAuthClient = createAdminClient();
  
  // 1. Create Auth User
  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email: values.email,
    password: "Welcome@2024", // Default password
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create auth user." };
  }

  const userId = authData.user.id;

  // 2. Create Profile
  const { error: profileError } = await adminAuthClient
    .from("profiles")
    // @ts-expect-error type inference limitation
    .insert([{
      id: userId,
      email: values.email,
      full_name: values.full_name,
      phone: values.phone || null,
      role: "student",
      employee_or_student_id: values.roll_number,
      is_active: true,
      is_archived: false,
    }]);

  if (profileError) {
    await adminAuthClient.auth.admin.deleteUser(userId); // rollback
    return { error: "Failed to create profile: " + profileError.message };
  }

  // 3. Create Student record
  const { error: studentError } = await adminAuthClient
    .from("students")
    // @ts-expect-error type inference limitation
    .insert([{
      profile_id: userId,
      roll_number: values.roll_number,
      department_id: values.department_id,
      semester_id: values.semester_id,
      section_id: values.section_id,
      batch_year: values.batch_year,
    }]);

  if (studentError) {
    await adminAuthClient.auth.admin.deleteUser(userId); // rollback
    return { error: "Failed to create student record: " + studentError.message };
  }

  revalidatePath("/admin/students");
  return { success: true };
}

export async function getStudents() {
  const adminClient = createAdminClient();
  // Fetch profiles joined with students data
  const { data, error } = await adminClient
    .from("profiles")
    .select(`
      id, email, full_name, is_active,
      students!inner(roll_number, batch_year)
    `)
    .eq("role", "student")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    // @ts-expect-error type inference limitation
    .update({ is_active: !currentStatus })
    .eq("id", userId);
    
  if (error) return { error: error.message };
  revalidatePath("/admin/students");
  revalidatePath("/admin/faculty");
  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/students");
  revalidatePath("/admin/faculty");
  return { success: true };
}

export async function resetUserPassword(userId: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: "Welcome@2024"
  });
  if (error) return { error: error.message };
  return { success: true };
}
