import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  getFoundationProfile,
  isSupabaseConfigured,
} from "@/lib/auth/foundation";
import { getProfile } from "@/lib/auth/session";
import type { DashboardRole } from "@/types/roles";
import { isDashboardRole } from "@/types/roles";
import { redirect } from "next/navigation";
import { getRoleHome } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function resolveDashboardProfile(expectedRole: DashboardRole) {
  if (!isSupabaseConfigured()) {
    return getFoundationProfile(expectedRole);
  }

  const profile = await getProfile();

  if (!profile || !isDashboardRole(profile.role)) {
    redirect("/login");
  }

  if (profile.role !== expectedRole) {
    redirect(getRoleHome(profile.role));
  }

  return profile;
}

export async function RoleDashboardLayout({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  const profile = await resolveDashboardProfile(role);

  return (
    <DashboardShell
      role={role}
      userName={profile.full_name}
      userEmail={profile.email}
      avatarUrl={profile.avatar_url}
      userId={profile.id}
    >
      {children}
    </DashboardShell>
  );
}
