import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getFacultySubjects } from "@/features/notes/actions";
import { getFacultyAssignments } from "@/features/assignments/actions";
import { FacultyAssignmentsClient } from "./client";

export default async function FacultyAssignmentsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  const [subjectsRes, assignmentsRes] = await Promise.all([
    getFacultySubjects(profile.id),
    getFacultyAssignments(profile.id)
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">Create assignments, track submissions, and provide grades.</p>
      </div>

      <FacultyAssignmentsClient 
        facultyId={profile.id}
        subjects={subjectsRes.data || []} 
        initialAssignments={assignmentsRes.data || []} 
      />
    </div>
  );
}
