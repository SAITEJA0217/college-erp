"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleFromPathname, ROLE_HOME } from "@/config/navigation";
import type { LoginValues } from "@/lib/validations/auth";
import { type AppRole, isDashboardRole } from "@/types/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(values: LoginValues) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const isEmail = values.identifier.includes("@");
    let profile: { email: string; role: AppRole } | null = null;
    
    if (isEmail) {
      // 1. Look up profile by email using service role key
      const { data, error } = await adminClient
        .from("profiles")
        .select("email, role")
        .eq("email", values.identifier)
        .maybeSingle() as unknown as { data: { email: string; role: AppRole } | null; error: any };
        
      if (error || !data) return { error: "Invalid credentials." };
      
      // Students MUST use Roll Number
      if (data.role === "student") {
        return { error: "Students must log in using their Roll Number, not email." };
      }
      profile = data;
    } else {
      // 1. Look up profile by employee_or_student_id
      const { data, error } = await adminClient
        .from("profiles")
        .select("email, role")
        .eq("employee_or_student_id", values.identifier)
        .maybeSingle() as unknown as { data: { email: string; role: AppRole } | null; error: any };
        
      if (error || !data) return { error: "Invalid credentials." };
      profile = data;
    }

    // 2. Sign in with standard Supabase auth

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: profile.email,
        password: values.password,
      });

    if (signInError) {
      return { error: signInError.message };
    }

    if (!profile.role || !isDashboardRole(profile.role)) {
      return { error: "Invalid role assigned to user." };
    }


    redirect(ROLE_HOME[profile.role] || "/login");
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "An unexpected error occurred." };
  }
}

export async function resetPasswordAction(identifier: string) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const isEmail = identifier.includes("@");
    let profile: { email: string; role: AppRole } | null = null;
    
    if (isEmail) {
      const { data, error } = await adminClient
        .from("profiles")
        .select("email, role")
        .eq("email", identifier)
        .maybeSingle() as unknown as { data: { email: string; role: AppRole } | null; error: any };
        
      if (!error && data) {
        // Students MUST use Roll Number, even for reset requests
        if (data.role === "student") {
          return { success: true }; // Silent failure to prevent enumeration
        }
        profile = data;
      }
    } else {
      const { data, error } = await adminClient
        .from("profiles")
        .select("email, role")
        .eq("employee_or_student_id", identifier)
        .maybeSingle() as unknown as { data: { email: string; role: AppRole } | null; error: any };
        
      if (!error && data) {
        profile = data;
      }
    }

    if (!profile) {
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
