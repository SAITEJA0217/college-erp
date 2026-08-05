import { getProfile } from "@/lib/auth/session";
import { ProfileClient } from "./client";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // Fetch profiles joined with students, department, semester, and section data using adminClient to bypass RLS
  const adminClient = createAdminClient();
  const { data: dbProfile } = await adminClient
    .from("profiles")
    .select(`
      *,
      students(
        roll_number,
        batch_year,
        admission_number,
        current_cgpa,
        credits_completed,
        mentor_name,
        academic_year,
        department:departments(
          id,
          name,
          code
        ),
        semester:semesters(
          id,
          semester_number
        ),
        section:sections(
          id,
          name
        )
      )
    `)
    .eq("id", profile.id)
    .maybeSingle();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProfileClient profile={dbProfile || profile} />
    </div>
  );
}
