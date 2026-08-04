import type { DashboardRole } from "@/types/roles";
import type { Profile } from "@/types/database";
import { ROLE_LABELS } from "@/config/navigation";
import { env } from "@/config/env";

export function isSupabaseConfigured() {
  return (
    !env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key" &&
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")
  );
}

export function getFoundationProfile(role: DashboardRole): Profile {
  return {
    id: `foundation-${role}`,
    email: `${role}@nexus.edu`,
    full_name: `${ROLE_LABELS[role]} Demo`,
    avatar_url: null,
    phone: null,
    role,
    employee_or_student_id:
      role === "student" ? "STU2024001" : `EMP-${role.toUpperCase()}`,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notification_preferences: { academic: true, placement: true, general: true, emergency: true }
  } as Profile;
}
