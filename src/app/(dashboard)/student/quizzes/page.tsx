import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentQuizzes } from "@/features/quizzes/actions";
import { StudentQuizzesClient } from "./client";

export default async function StudentQuizzesPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data, error } = await getStudentQuizzes(profile.id);

  if (error) {
    return <div className="p-8 text-destructive">Failed to load quizzes: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="text-muted-foreground">Attempt assigned quizzes and view your results.</p>
      </div>

      <StudentQuizzesClient 
        studentId={profile.id}
        quizzes={data || []} 
      />
    </div>
  );
}
