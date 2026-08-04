import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getFacultySubjects } from "@/features/notes/actions";
import { getFacultyQuizzes } from "@/features/quizzes/actions";
import { FacultyQuizzesClient } from "./client";

export default async function FacultyQuizzesPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  const [subjectsRes, quizzesRes] = await Promise.all([
    getFacultySubjects(profile.id),
    getFacultyQuizzes(profile.id)
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="text-muted-foreground">Create dynamic online quizzes and track student performance.</p>
      </div>

      <FacultyQuizzesClient 
        facultyId={profile.id}
        subjects={subjectsRes.data || []} 
        initialQuizzes={quizzesRes.data || []} 
      />
    </div>
  );
}
