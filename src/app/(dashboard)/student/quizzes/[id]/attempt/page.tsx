import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startQuizAttempt, getQuizQuestionsForAttempt } from "@/features/quizzes/actions";
import { QuizAttemptClient } from "./client";

export default async function QuizAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch quiz details
  const { data: quiz, error: quizErr } = await (supabase as any)
    .from("quizzes")
    .select("id, title, time_limit_minutes, start_time, end_time")
    .eq("id", resolvedParams.id)
    .single();

  if (quizErr || !quiz) {
    return <div className="p-8">Quiz not found</div>;
  }

  // Attempt to start the quiz
  const attemptRes = await startQuizAttempt(resolvedParams.id, profile.id);
  
  if (attemptRes.error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-destructive mb-2">Cannot Start Quiz</h2>
        <p className="text-muted-foreground">{attemptRes.error}</p>
      </div>
    );
  }

  const attempt = attemptRes.data;

  // Fetch questions
  const questionsRes = await getQuizQuestionsForAttempt(resolvedParams.id);
  if (questionsRes.error) {
    return <div className="p-8">Failed to load questions</div>;
  }

  // Shuffle questions if random_questions was true? (Skipping complex random logic for now, just sending as is)

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full space-y-6 p-4 md:p-8 pt-6 pb-24">
      <QuizAttemptClient 
        quiz={quiz} 
        attempt={attempt} 
        questions={questionsRes.data || []} 
      />
    </div>
  );
}
