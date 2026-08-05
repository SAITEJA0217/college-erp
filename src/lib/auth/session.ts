import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/config/navigation";
import {
  isDashboardRole,
  type AppRole,
  type DashboardRole,
} from "@/types/roles";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile query failed:", error);
    throw error;
  }

  if (!data) {
    return null;
  }
  return data;
}

export function getRoleHome(role: AppRole): string {
  if (isDashboardRole(role)) {
    return ROLE_HOME[role];
  }
  return "/login";
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireRole(allowed: DashboardRole | DashboardRole[]) {
  const profile = await requireProfile();
  const roles = Array.isArray(allowed) ? allowed : [allowed];

  if (!isDashboardRole(profile.role) || !roles.includes(profile.role)) {
    redirect(getRoleHome(profile.role));
  }

  return profile;
}
