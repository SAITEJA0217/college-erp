import { getProfile } from "@/lib/auth/session";
import { ProfileClient } from "./client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // Fetch fresh profile from DB to get notification preferences
  const supabase = await createClient();
  const { data: dbProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profile.id)
    .single();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProfileClient profile={dbProfile || profile} />
    </div>
  );
}
