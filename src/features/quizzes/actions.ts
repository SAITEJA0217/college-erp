"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFacultyQuizzes(facultyId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        time_limit_minutes,
        start_time,
        end_time,
        is_published,
        subject_id,
        subjects (
          name,
          code
        ),
        quiz_questions (id),
        quiz_attempts (id)
      `)
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (data as any[]).map(q => ({
      ...q,
      subject_name: q.subjects?.name,
      subject_code: q.subjects?.code,
      questions_count: q.quiz_questions?.length || 0,
      attempts_count: q.quiz_attempts?.length || 0
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createQuiz(formData: FormData, questions: any[]) {
  try {
    const supabase = await createClient();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subject_id = formData.get("subject_id") as string;
    const faculty_id = formData.get("faculty_id") as string;
    const time_limit_minutes = parseInt(formData.get("time_limit_minutes") as string, 10);
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const is_published = formData.get("is_published") === "true";

    // 1. Insert Quiz
    const { data: quiz, error: quizErr } = await (supabase as any)
      .from("quizzes")
      .insert({
        title,
        description,
        subject_id,
        faculty_id,
        time_limit_minutes,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        is_published
      })
      .select("id")
      .single();

    if (quizErr) throw quizErr;

    // 2. Insert Questions
    if (questions && questions.length > 0) {
      const formattedQuestions = questions.map(q => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        points: q.points || 1
      }));

      const { error: qErr } = await (supabase as any)
        .from("quiz_questions")
        .insert(formattedQuestions);

      if (qErr) throw qErr;
    }

    revalidatePath("/faculty/quizzes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getStudentQuizzes(studentId: string) {
  try {
    const supabase = await createClient();
    
    const { data: profile } = await (supabase as any)
      .from("students")
      .select("sections(semester_id)")
      .eq("profile_id", studentId)
      .single();
      
    if (!profile?.sections?.semester_id) return { error: "Could not determine enrolled subjects" };
    
    const semesterId = profile.sections.semester_id;

    const { data: quizzes, error } = await (supabase as any)
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        time_limit_minutes,
        start_time,
        end_time,
        is_published,
        subjects!inner (
          name,
          code,
          semester_id
        ),
        quiz_attempts (
          id,
          student_id,
          start_time,
          end_time,
          is_completed,
          score
        ),
        quiz_questions (
          points
        )
      `)
      .eq("subjects.semester_id", semesterId)
      .eq("is_published", true)
      .order("start_time", { ascending: true });

    if (error) throw error;

    const mapped = (quizzes as any[]).map(q => {
      const myAttempt = q.quiz_attempts?.find((a: any) => a.student_id === studentId) || null;
      const totalPoints = q.quiz_questions?.reduce((acc: number, curr: any) => acc + curr.points, 0) || 0;
      
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        time_limit_minutes: q.time_limit_minutes,
        start_time: q.start_time,
        end_time: q.end_time,
        subject_name: q.subjects?.name,
        subject_code: q.subjects?.code,
        attempt: myAttempt,
        total_points: totalPoints,
        total_questions: q.quiz_questions?.length || 0
      };
    });

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function startQuizAttempt(quizId: string, studentId: string) {
  try {
    const supabase = await createClient();
    
    // Check if within time window
    const { data: quiz, error: quizErr } = await (supabase as any)
      .from("quizzes")
      .select("start_time, end_time")
      .eq("id", quizId)
      .single();

    if (quizErr || !quiz) throw new Error("Quiz not found");

    const now = new Date();
    if (now < new Date(quiz.start_time) || now > new Date(quiz.end_time)) {
      throw new Error("Quiz is not currently active");
    }

    // Insert attempt
    const { data: attempt, error: attemptErr } = await (supabase as any)
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        start_time: now.toISOString()
      })
      .select("id, start_time")
      .single();

    if (attemptErr) {
      if (attemptErr.code === '23505') { // Unique violation
        // Find existing attempt
        const { data: existing } = await (supabase as any)
          .from("quiz_attempts")
          .select("id, start_time, is_completed")
          .eq("quiz_id", quizId)
          .eq("student_id", studentId)
          .single();
        
        if (existing?.is_completed) {
          throw new Error("You have already completed this quiz.");
        }
        return { data: existing };
      }
      throw attemptErr;
    }

    return { data: attempt };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getQuizQuestionsForAttempt(quizId: string) {
  try {
    const supabase = await createClient();
    // Intentionally omit correct_answer for students
    const { data, error } = await (supabase as any)
      .from("quiz_questions")
      .select(`
        id,
        question_text,
        question_type,
        options,
        points
      `)
      .eq("quiz_id", quizId);

    if (error) throw error;
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function submitQuizAttempt(attemptId: string, answers: { question_id: string, answer: string }[]) {
  try {
    const supabase = await createClient();
    
    // 1. Get Attempt and Quiz Details
    const { data: attempt, error: attemptErr } = await (supabase as any)
      .from("quiz_attempts")
      .select("is_completed, start_time, quiz_id")
      .eq("id", attemptId)
      .single();

    if (attemptErr || !attempt) throw new Error("Attempt not found");
    if (attempt.is_completed) throw new Error("Quiz already submitted");

    const { data: quiz } = await (supabase as any)
      .from("quizzes")
      .select("time_limit_minutes, end_time")
      .eq("id", attempt.quiz_id)
      .single();

    // 2. Validate time limit (add 2 minutes grace period for network latency)
    const now = new Date();
    const startTime = new Date(attempt.start_time);
    const timeLimitMs = (quiz.time_limit_minutes + 2) * 60 * 1000;
    
    if (now.getTime() > startTime.getTime() + timeLimitMs || now > new Date(quiz.end_time)) {
      // Still accept it if we want to penalize later, but let's just mark it submitted. 
      // In a strict mode, we'd throw here. We will proceed to grade it but they could be penalized.
      console.log("Submitted slightly after time limit");
    }

    // 3. Get all correct answers for grading
    const { data: questions } = await (supabase as any)
      .from("quiz_questions")
      .select("id, correct_answer, points, question_type")
      .eq("quiz_id", attempt.quiz_id);

    let totalScore = 0;
    const answerInserts = [];

    // 4. Auto-grade
    for (const ans of answers) {
      const q = questions?.find((x: any) => x.id === ans.question_id);
      if (!q) continue;

      let isCorrect = false;
      let pointsAwarded = 0;

      // Case-insensitive string match for short answer, exact match for MCQ/TF
      if (q.question_type === 'ShortAnswer') {
        if (ans.answer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
          isCorrect = true;
          pointsAwarded = q.points;
        }
      } else {
        if (ans.answer === q.correct_answer) {
          isCorrect = true;
          pointsAwarded = q.points;
        }
      }

      totalScore += pointsAwarded;
      answerInserts.push({
        attempt_id: attemptId,
        question_id: ans.question_id,
        student_answer: ans.answer,
        is_correct: isCorrect,
        points_awarded: pointsAwarded
      });
    }

    // 5. Save Answers
    if (answerInserts.length > 0) {
      await (supabase as any)
        .from("quiz_answers")
        .insert(answerInserts);
    }

    // 6. Complete Attempt
    await (supabase as any)
      .from("quiz_attempts")
      .update({
        is_completed: true,
        end_time: now.toISOString(),
        score: totalScore
      })
      .eq("id", attemptId);

    revalidatePath("/student/quizzes");
    return { success: true, score: totalScore };
  } catch (error: any) {
    return { error: error.message };
  }
}
