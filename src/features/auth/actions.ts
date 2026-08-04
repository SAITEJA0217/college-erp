"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleFromPathname, ROLE_HOME } from "@/config/navigation";
import type { LoginValues } from "@/lib/validations/auth";
import { type AppRole, isDashboardRole } from "@/types/roles";
import { revalidatePath } from "next/cache";

export async function loginAction(values: LoginValues) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // 1. Look up email using the service role key to bypass RLS
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("email, role")
      .eq("employee_or_student_id", values.identifier)
      .maybeSingle() as unknown as { data: { email: string; role: AppRole } | null; error: any };

    if (profileError || !profile) {
      return { error: "Invalid credentials." };
    }

    // 2. Sign in with standard Supabase auth
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: values.password,
    });

    if (signInError) {
      return { error: "Invalid credentials." };
    }

    if (!profile.role || !isDashboardRole(profile.role)) {
      return { error: "Invalid role assigned to user." };
    }

    // 3. Return the destination based on role
    return { destination: ROLE_HOME[profile.role] || "/login" };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function resetPasswordAction(identifier: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("email")
      .eq("employee_or_student_id", identifier)
      .maybeSingle() as { data: { email: string } | null; error: any };

    if (profileError || !profile) {
      // Return success anyway to prevent user enumeration
      return { success: true };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      console.error(error);
      return { error: "Failed to send reset email. Please try again." };
    }

    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
