import { createClient } from "@/lib/supabase/server";
import { type Profile } from "@/types/database";
import { cache } from "react";

export const getUserProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
});

export async function assertRole(allowedRoles: ("admin" | "faculty" | "student" | "hod" | "placement")[]): Promise<Profile> {
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("Unauthorized: You must be logged in.");
  }
  if (!allowedRoles.includes(profile.role as any)) {
    throw new Error(`Forbidden: Access denied. Requires ${allowedRoles.join(" or ")} role.`);
  }
  return profile;
}
