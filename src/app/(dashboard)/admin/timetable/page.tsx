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
      semester:semesters (
        id,
        semester_number,
        program:programs (
          id,
          name,
          department:departments (
            name
          )
        )
      )
    `)
    .eq("is_archived", false)
    .order("name");

  const formattedSections = (sections || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    semester_id: s.semester?.id,
    semester_number: s.semester?.semester_number,
    program_name: s.semester?.program?.name,
    department_name: s.semester?.program?.department?.name,
    label: `${s.semester?.program?.department?.name} > ${s.semester?.program?.name} > Sem ${s.semester?.semester_number} > Section ${s.name}`,
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
