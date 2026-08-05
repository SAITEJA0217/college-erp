"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/features/notifications/actions";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

export interface StudentResultInput {
  studentId: string;
  marksObtained: number;
  maxMarks: number;
}

const studentResultInputSchema = z.object({
  studentId: z.string().uuid("Invalid student reference"),
  marksObtained: z.number().min(0, "Marks cannot be negative").max(100, "Marks cannot exceed 100"),
  maxMarks: z.number().int().min(1, "Maximum marks must be at least 1").max(100),
});

const publishSubjectResultsSchema = z.object({
  subjectId: z.string().uuid("Invalid subject reference"),
  semesterId: z.string().uuid("Invalid semester reference"),
  resultsList: z.array(studentResultInputSchema).min(1, "Results list cannot be empty"),
});

// Helper to calculate letter grade and points based on standard UGC boundary scales
function calculateGradeAndPoints(obtained: number, max: number): { grade: string; points: number } {
  const percent = max === 0 ? 0 : (obtained / max) * 100;
  if (percent >= 90) return { grade: "O", points: 10 };
  if (percent >= 80) return { grade: "A+", points: 9 };
  if (percent >= 70) return { grade: "A", points: 8 };
  if (percent >= 60) return { grade: "B+", points: 7 };
  if (percent >= 55) return { grade: "B", points: 6 };
  if (percent >= 50) return { grade: "C", points: 5 };
  return { grade: "F", points: 0 };
}

function getFriendlyErrorMessage(err: any): string {
  if (err?.code === "23505") return "Results for this subject have already been published for these students.";
  if (err?.code === "23503") return "Invalid student, subject, or semester reference.";
  return err?.message || "Failed to publish subject results.";
}

// 2. Publish results in bulk for a subject
export async function publishSubjectResults(params: any) {
  try {
    await assertRole(["faculty", "admin"]);
    const validated = publishSubjectResultsSchema.parse(params);

    // Business Logic Validation: Obtained marks cannot exceed max marks
    for (const res of validated.resultsList) {
      if (res.marksObtained > res.maxMarks) {
        return { success: false, error: `Invalid entry: Obtained marks (${res.marksObtained}) cannot exceed maximum marks (${res.maxMarks}).` };
      }
    }

    const supabase = await createClient();

    const upsertRows = validated.resultsList.map((res) => {
      const { grade, points } = calculateGradeAndPoints(res.marksObtained, res.maxMarks);
      return {
        student_id: res.studentId,
        subject_id: validated.subjectId,
        semester_id: validated.semesterId,
        marks_obtained: res.marksObtained,
        max_marks: res.maxMarks,
        grade,
        grade_points: points,
        is_published: true,
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await (supabase as any)
      .from("results")
      .upsert(upsertRows, { onConflict: "student_id,subject_id" });

    if (error) throw error;

    // Notify students that results are published
    try {
      const { data: subjectData } = await (supabase as any)
        .from("subjects")
        .select("name")
        .eq("id", validated.subjectId)
        .single();

      const subjectName = (subjectData as any)?.name || "Subject";
      const studentIds = validated.resultsList.map((res) => res.studentId);

      await sendNotification({
        userIds: studentIds,
        title: `Final Results Published`,
        body: `Your end-semester results and letter grades for ${subjectName} have been published.`,
        category: "academic",
        link: "/student/results",
      });
    } catch (err) {
      console.error("Failed to send results notifications:", err);
    }

    // Update current CGPA in student profile as a cached value
    try {
      for (const res of validated.resultsList) {
        await updateStudentCGPA(res.studentId);
      }
    } catch (cgpaErr) {
      console.error("Failed to update student CGPA:", cgpaErr);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

// 3. Helper to update current CGPA for a student
export async function updateStudentCGPA(studentId: string) {
  try {
    z.string().uuid().parse(studentId);
    const supabase = await createClient();

    // Get all published results for the student
    const { data: results } = await (supabase as any)
      .from("results")
      .select(`
        grade_points,
        subject:subjects ( credits )
      `)
      .eq("student_id", studentId)
      .eq("is_published", true);

    if (!results || (results as any[]).length === 0) return;

    let totalCreditPoints = 0;
    let totalCredits = 0;

    (results as any[]).forEach((row: any) => {
      const credits = row.subject?.credits || 0;
      totalCreditPoints += row.grade_points * credits;
      totalCredits += credits;
    });

    const cgpa = totalCredits === 0 ? 0 : Number((totalCreditPoints / totalCredits).toFixed(2));

    await (supabase as any)
      .from("students")
      .update({ 
        current_cgpa: cgpa,
        credits_completed: totalCredits
      })
      .eq("profile_id", studentId);
  } catch (err) {
    console.error("Failed to update student CGPA:", err);
  }
}

// 4. Get results for student (organized by semesters, computes SGPA and overall CGPA)
export async function getStudentTranscript(studentProfileId: string) {
  try {
    const profile = await assertRole(["student", "faculty", "hod", "admin"]);
    z.string().uuid().parse(studentProfileId);

    if (profile.role === "student" && profile.id !== studentProfileId) {
      return null;
    }

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("results")
      .select(`
        id,
        grade,
        grade_points,
        marks_obtained,
        max_marks,
        semester:semesters (
          id,
          semester_number,
          academic_year:academic_years ( name )
        ),
        subject:subjects (
          id,
          name,
          code,
          credits
        )
      `)
      .eq("student_id", studentProfileId)
      .eq("is_published", true);

    if (error) throw error;

    // Group by semester
    const semestersGrouped: Record<string, { semesterNumber: number; academicYear: string; courses: any[]; sgpa: number; totalCredits: number }> = {};
    
    let totalOverallCredits = 0;
    let totalOverallPoints = 0;

    (data || []).forEach((row: any) => {
      const sem = row.semester;
      const sub = row.subject;
      if (!sem || !sub) return;

      const semId = sem.id;
      if (!semestersGrouped[semId]) {
        semestersGrouped[semId] = {
          semesterNumber: sem.semester_number,
          academicYear: sem.academic_year?.name || "N/A",
          courses: [],
          sgpa: 0,
          totalCredits: 0,
        };
      }

      semestersGrouped[semId].courses.push({
        subjectName: sub.name,
        subjectCode: sub.code,
        credits: sub.credits,
        marks: row.marks_obtained,
        maxMarks: row.max_marks,
        grade: row.grade,
        points: row.grade_points,
      });

      semestersGrouped[semId].totalCredits += sub.credits;
      totalOverallCredits += sub.credits;
      totalOverallPoints += row.grade_points * sub.credits;
    });

    // Compute SGPA for each semester
    const semestersList = Object.values(semestersGrouped).map((sem) => {
      let creditPoints = 0;
      sem.courses.forEach((c) => {
        creditPoints += c.points * c.credits;
      });
      const sgpa = sem.totalCredits === 0 ? 0 : Number((creditPoints / sem.totalCredits).toFixed(2));
      return {
        ...sem,
        sgpa,
      };
    }).sort((a, b) => a.semesterNumber - b.semesterNumber);

    const overallCgpa = totalOverallCredits === 0 ? 0 : Number((totalOverallPoints / totalOverallCredits).toFixed(2));

    return {
      semesters: semestersList,
      cgpa: overallCgpa,
      totalCredits: totalOverallCredits,
    };
  } catch {
    return null;
  }
}

