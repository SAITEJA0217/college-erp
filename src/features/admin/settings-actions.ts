"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const holidaySchema = z.object({
  name: z.string().trim().min(1, "Holiday name is required").max(100),
  date: z.string().min(1, "Holiday date is required"),
});

const orgSettingsSchema = z.object({
  name: z.string().trim().min(1, "Institution name is required").max(100),
  workingDays: z.array(z.string().trim().min(1)),
  academicYearId: z.string().uuid("Invalid academic year reference").optional().nullable(),
});

const userRoleSchema = z.object({
  userId: z.string().uuid("Invalid user reference"),
  newRole: z.enum(["admin", "faculty", "student", "hod", "placement"]),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This entry already exists.";
  if (err.code === "23503") return "Invalid related reference keys.";
  return err.message || "A database error occurred.";
}

// 1. Holidays Management
export async function getHolidays() {
  try {
    await assertRole(["admin"]);
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("holidays")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Failed to load holidays" };
  }
}

export async function createHoliday(name: string, date: string) {
  try {
    await assertRole(["admin"]);
    const validated = holidaySchema.parse({ name, date });
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("holidays")
      .insert(validated);
    
    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteHoliday(id: string) {
  try {
    await assertRole(["admin"]);
    z.string().uuid().parse(id);
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("holidays")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

// 2. Organization Settings
export async function getOrganizationSettings() {
  try {
    await assertRole(["admin"]);
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("organization_settings")
      .select(`
        *,
        academic_year:academic_years ( id, name )
      `)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Allow single row missing
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Failed to load settings" };
  }
}

export async function updateOrganizationSettings({
  name,
  workingDays,
  academicYearId,
}: {
  name: string;
  workingDays: string[];
  academicYearId: string;
}) {
  try {
    await assertRole(["admin"]);
    const validated = orgSettingsSchema.parse({ name, workingDays, academicYearId });
    const supabase = await createClient();

    // Find the single row id
    const { data: existing } = await (supabase as any)
      .from("organization_settings")
      .select("id")
      .limit(1)
      .single();

    const id = (existing as any)?.id;

    const payload = {
      name: validated.name,
      working_days: validated.workingDays,
      academic_year_id: validated.academicYearId || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = id
      ? await (supabase as any).from("organization_settings").update(payload).eq("id", id)
      : await (supabase as any).from("organization_settings").insert(payload);

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

// 3. User Roles Administration
export async function getAllUsers() {
  try {
    await assertRole(["admin"]);
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, email, role, employee_or_student_id, is_active")
      .order("full_name", { ascending: true });
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Failed to load users" };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await assertRole(["admin"]);
    const validated = userRoleSchema.parse({ userId, newRole });
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ role: validated.newRole })
      .eq("id", validated.userId);

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}
