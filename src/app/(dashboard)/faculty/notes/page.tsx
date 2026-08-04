import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getFacultySubjects, getNotesForFaculty } from "@/features/notes/actions";
import { FacultyNotesClient } from "./client";

export default async function FacultyNotesPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  const [subjectsRes, notesRes] = await Promise.all([
    getFacultySubjects(profile.id),
    getNotesForFaculty(profile.id)
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
        <p className="text-muted-foreground">Upload and manage study materials for your subjects.</p>
      </div>

      <FacultyNotesClient 
        facultyId={profile.id}
        subjects={subjectsRes.data || []} 
        initialNotes={notesRes.data || []} 
      />
    </div>
  );
}
