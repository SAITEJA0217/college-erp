import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminTimetableClient } from "./client";

export default async function AdminTimetablePage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const supabase = await createClient();
  
  // Fetch sections with relationships to display cleanly
  const { data: sections } = await supabase
    .from("sections")
    .select(`
      id,
      name,
      semesters (
        id,
        number,
        programs (
          id,
          name,
          departments (
            name
          )
        )
      )
    `)
    .eq("is_archived", false)
    .order("name");

  // Fetch faculty
  const { data: faculty } = await supabase
    .from("faculty")
    .select(`
      profile_id,
      profiles (
        full_name
      )
    `)
    .eq("is_archived", false);

  // Fetch subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code, semester_id")
    .eq("is_archived", false);

  const formattedSections = (sections || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    semester_id: s.semesters?.id,
    label: `${s.semesters?.programs?.departments?.name} > ${s.semesters?.programs?.name} > Sem ${s.semesters?.number} > Section ${s.name}`,
  }));

  const formattedFaculty = (faculty || []).map((f: any) => ({
    id: f.profile_id,
    name: f.profiles?.full_name || "Unknown Faculty",
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
        <p className="text-muted-foreground">Schedule classes and manage timetables across all sections.</p>
      </div>

      <AdminTimetableClient 
        sections={formattedSections} 
        faculty={formattedFaculty} 
        subjects={subjects || []} 
      />
    </div>
  );
}
