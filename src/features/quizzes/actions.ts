"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const quizSchema = z.object({
  title: z.string().trim().min(1, "Quiz title is required").max(100),
  description: z.string().trim().max(1000).optional().nullable(),
  time_limit_minutes: z.number().int().min(1, "Time limit must be at least 1 minute").max(180),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  subject_id: z.string().uuid("Invalid subject reference"),
  faculty_id: z.string().uuid("Invalid faculty reference"),
});

const quizQuestionSchema = z.object({
  question_text: z.string().trim().min(1, "Question text is required"),
  question_type: z.enum(["MCQ", "TF", "ShortAnswer"]),
  options: z.array(z.string().trim()).optional().nullable(),
  correct_answer: z.string().trim().min(1, "Correct answer is required"),
  points: z.number().int().min(1, "Points must be at least 1").max(20),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This record already exists.";
  if (err.code === "23503") return "Invalid related reference keys.";
  return err.message || "Failed to process quiz operation.";
}

export async function getFacultyQuizzes(facultyId: string) {
  try {
    const profile = await assertRole(["faculty", "admin"]);
    if (profile.role === "faculty" && profile.id !== facultyId) {
      return { error: "Forbidden: Access denied." };
    }

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
    return { error: error.message || "Failed to load quizzes" };
  }
}

export async function createQuiz(formData: FormData, questions: any[]) {
  try {
    const profile = await assertRole(["faculty"]);

    const rawValues = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      time_limit_minutes: parseInt(formData.get("time_limit_minutes") as string, 10),
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      subject_id: formData.get("subject_id") as string,
      faculty_id: formData.get("faculty_id") as string,
    };

    const validated = quizSchema.parse(rawValues);
    const validatedQuestions = z.array(quizQuestionSchema).min(1, "At least one question is required").parse(questions);
    
    if (profile.id !== validated.faculty_id) {
      return { error: "Forbidden: Faculty ID mismatch." };
    }

    // Validate times window
    if (new Date(validated.start_time) >= new Date(validated.end_time)) {
      return { error: "Start time must be before end time." };
    }

    const is_published = formData.get("is_published") === "true";
    const supabase = await createClient();

    // 1. Insert Quiz
    const { data: quiz, error: quizErr } = await (supabase as any)
      .from("quizzes")
      .insert({
        subject_id: validated.subject_id,
        faculty_id: validated.faculty_id,
        title: validated.title,
        description: validated.description || null,
        time_limit_minutes: validated.time_limit_minutes,
        start_time: validated.start_time,
        end_time: validated.end_time,
        is_published,
      })
      .select("id")
      .single();

    if (quizErr) throw quizErr;

    const quizId = quiz.id;

    // 2. Insert Questions
    if (validatedQuestions.length > 0) {
      const formattedQuestions = validatedQuestions.map((q, idx) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || null,
        correct_answer: q.correct_answer,
        points: q.points,
        order_index: idx,
      }));

      const { error: qErr } = await (supabase as any)
        .from("quiz_questions")
        .insert(formattedQuestions);

      if (qErr) throw qErr;
    }

    // Notify students if quiz is published
    if (is_published) {
      try {
        const { data: subjectData } = await (supabase as any)
          .from("subjects")
          .select("section_id, name")
          .eq("id", validated.subject_id)
          .single();

        if ((subjectData as any)?.section_id) {
          const { data: students } = await (supabase as any)
            .from("students")
            .select("profile_id")
            .eq("section_id", (subjectData as any).section_id);

          if (students && students.length > 0) {
            const studentIds = students.map((s: any) => s.profile_id);
            await sendNotification({
              userIds: studentIds,
              title: `New Quiz Published`,
              body: `Quiz "${validated.title}" has been published for ${(subjectData as any).name}.`,
              category: "academic",
              link: "/student/quizzes",
            });
          }
        }
      } catch (err) {
        console.error("Failed to send quiz notifications:", err);
      }
    }

    revalidatePath("/faculty/quizzes");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function getStudentQuizzes(studentId: string) {
  try {
    const profile = await assertRole(["student", "faculty", "admin"]);
    if (profile.role === "student" && profile.id !== studentId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    
    const { data: student } = await (supabase as any)
      .from("students")
      .select("semester_id")
      .eq("profile_id", studentId)
      .single();
      
    if (!student?.semester_id) return { error: "Could not determine enrolled subjects" };
    
    const semesterId = student.semester_id;

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
    return { error: error.message || "Failed to load quizzes" };
  }
}

export async function startQuizAttempt(quizId: string, studentId: string) {
  try {
    const profile = await assertRole(["student"]);
    z.string().uuid().parse(quizId);
    z.string().uuid().parse(studentId);

    if (profile.id !== studentId) {
      return { error: "Forbidden: You cannot start attempts for another student." };
    }

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
    return { error: error.message || "Failed to start quiz" };
  }
}

export async function getQuizQuestionsForAttempt(quizId: string) {
  try {
    await assertRole(["student", "faculty", "admin"]);
    z.string().uuid().parse(quizId);

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
    return { error: error.message || "Failed to load questions" };
  }
}

export async function submitQuizAttempt(attemptId: string, answers: { question_id: string, answer: string }[]) {
  try {
    const profile = await assertRole(["student"]);
    z.string().uuid().parse(attemptId);
    z.array(z.object({
      question_id: z.string().uuid(),
      answer: z.string().trim(),
    })).parse(answers);

    const supabase = await createClient();
    
    // 1. Get Attempt and Quiz Details
    const { data: attempt, error: attemptErr } = await (supabase as any)
      .from("quiz_attempts")
      .select("is_completed, start_time, quiz_id, student_id")
      .eq("id", attemptId)
      .single();

    if (attemptErr || !attempt) throw new Error("Attempt not found");
    if (attempt.is_completed) throw new Error("Quiz already submitted");

    if (profile.id !== attempt.student_id) {
      return { error: "Forbidden: Not your attempt." };
    }

    const { data: quiz } = await (supabase as any)
      .from("quizzes")
      .select("time_limit_minutes, end_time")
      .eq("id", attempt.quiz_id)
      .single();

    const now = new Date();
    const startTime = new Date(attempt.start_time);
    const timeLimitMs = (quiz.time_limit_minutes + 2) * 60 * 1000;

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
    return { error: getFriendlyErrorMessage(error) };
  }
}
