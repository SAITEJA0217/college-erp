import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminTimetableClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminTimetablePage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const supabase = createAdminClient();
  
  // Fetch sections concurrently
  const { data: sections } = await supabase
    .from("sections")
    .select(`
      id,
      name,
      academic_year_id,
      program:programs (
        id,
        name,
        department:departments (
          name
        )
      )
    `)
    .eq("is_archived", false)
    .order("name");

  const formattedSections = (sections || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    academic_year_id: s.academic_year_id,
    program_name: s.program?.name,
    department_name: s.program?.department?.name,
    label: `${s.program?.department?.name} > ${s.program?.name} > Section ${s.name}`,
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
        <p className="text-muted-foreground">Schedule classes and manage timetables across all sections.</p>
      </div>

      <AdminTimetableClient sections={formattedSections} />
    </div>
  );
}
