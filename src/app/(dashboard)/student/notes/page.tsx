import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentNotes } from "@/features/notes/actions";
import { StudentNotesClient } from "./client";

export default async function StudentNotesPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data, error } = await getStudentNotes(profile.id);

  if (error) {
    return <div className="p-8 text-destructive">Failed to load study materials: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
        <p className="text-muted-foreground">Access notes, presentations, and resources for your enrolled subjects.</p>
      </div>

      <StudentNotesClient initialNotes={data || []} />
    </div>
  );
}
