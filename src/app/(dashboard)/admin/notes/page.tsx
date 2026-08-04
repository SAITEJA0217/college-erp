import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNotesClient } from "./client";

export default async function AdminNotesPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select(`
      id,
      title,
      description,
      unit,
      resource_type,
      url,
      created_at,
      subjects (
        name,
        code
      ),
      faculty (
        profiles (
          full_name
        )
      )
    `)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-destructive">Failed to load study materials.</div>;
  }

  const mapped = (notes as any[]).map(n => ({
    id: n.id,
    title: n.title,
    description: n.description,
    unit: n.unit,
    resource_type: n.resource_type,
    url: n.url,
    created_at: n.created_at,
    subject_name: n.subjects?.name,
    subject_code: n.subjects?.code,
    faculty_name: n.faculty?.profiles?.full_name || "Unknown Faculty",
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Study Materials</h1>
        <p className="text-muted-foreground">Oversight of all uploaded resources across the college.</p>
      </div>

      <AdminNotesClient initialNotes={mapped} />
    </div>
  );
}
