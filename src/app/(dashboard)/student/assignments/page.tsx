import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentAssignments } from "@/features/assignments/actions";
import { StudentAssignmentsClient } from "./client";

export default async function StudentAssignmentsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data, error } = await getStudentAssignments(profile.id);

  if (error) {
    return <div className="p-8 text-destructive">Failed to load assignments: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">Manage your pending assignments and view your grades.</p>
      </div>

      <StudentAssignmentsClient 
        studentId={profile.id}
        assignments={data || []} 
      />
    </div>
  );
}
