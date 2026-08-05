"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

export interface StudentMarksInput {
  studentId: string;
  marksObtained: number;
}

const studentMarksInputSchema = z.object({
  studentId: z.string().uuid("Invalid student reference"),
  marksObtained: z.number().min(0, "Marks cannot be negative").max(100, "Marks cannot exceed 100"),
});

const saveInternalMarksSchema = z.object({
  subjectId: z.string().uuid("Invalid subject reference"),
  assessmentName: z.string().trim().min(1, "Assessment name is required").max(50),
  maxMarks: z.number().int().min(1, "Maximum marks must be at least 1").max(100),
  marksList: z.array(studentMarksInputSchema).min(1, "Marks list cannot be empty"),
  facultyProfileId: z.string().uuid("Invalid faculty reference"),
});

const publishInternalMarksSchema = z.object({
  subjectId: z.string().uuid("Invalid subject reference"),
  sectionId: z.string().uuid("Invalid section reference"),
  assessmentName: z.string().trim().min(1, "Assessment name is required"),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "Marks for this assessment have already been recorded for this student.";
  if (err.code === "23503") return "Invalid student, subject, or faculty reference.";
  return err.message || "Failed to process internal marks operation.";
}

// 1. Get subjects and sections assigned to a faculty
export async function getFacultyClasses(facultyProfileId: string) {
  try {
    const profile = await assertRole(["faculty", "admin"]);
    if (profile.role === "faculty" && profile.id !== facultyProfileId) {
      throw new Error("Forbidden: Access denied.");
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("faculty_class_assignments")
      .select(`
        id,
        section:sections (
          id,
          name,
          semester:semesters (
            semester_number,
            program:programs ( name )
          )
        ),
        subject:subjects (
          id,
          name,
          code
        )
      `)
      .eq("faculty_profile_id", facultyProfileId)
      .eq("is_archived", false);

    if (error) throw error;

    const formatted = (data || []).map((assignment: any) => {
      const sec = assignment.section;
      const sub = assignment.subject;
      return {
        assignmentId: assignment.id,
        sectionId: sec?.id,
        sectionLabel: `${sec?.semester?.program?.name} - Sem ${sec?.semester?.semester_number} (${sec?.name})`,
        subjectId: sub?.id,
        subjectName: `${sub?.name} (${sub?.code})`,
      };
    });

    return formatted;
  } catch (err) {
    return [];
  }
}

// 2. Get students in a section to record marks
export async function getStudentsForSection(sectionId: string) {
  try {
    await assertRole(["faculty", "admin"]);
    z.string().uuid().parse(sectionId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        students!inner (
          roll_number
        )
      `)
      .eq("role", "student")
      .eq("students.section_id", sectionId)
      .eq("is_archived", false);

    if (error) throw error;

    return (data || []).map((s: any) => ({
      studentId: s.id,
      studentName: s.full_name,
      rollNumber: s.students?.[0]?.roll_number || "—",
    })).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  } catch (err) {
    return [];
  }
}

// 3. Upsert internal assessment marks list for a section
export async function saveInternalMarks(params: any) {
  try {
    const profile = await assertRole(["faculty"]);
    const validated = saveInternalMarksSchema.parse(params);

    if (profile.id !== validated.facultyProfileId) {
      return { success: false, error: "Forbidden: Faculty ID mismatch." };
    }

    // Business Logic Validation: Obtained marks cannot exceed max marks
    for (const m of validated.marksList) {
      if (m.marksObtained > validated.maxMarks) {
        return { success: false, error: `Invalid entry: Obtained marks (${m.marksObtained}) cannot exceed maximum marks (${validated.maxMarks}).` };
      }
    }

    const supabase = await createClient();

    const upsertRows = validated.marksList.map((m) => ({
      student_id: m.studentId,
      subject_id: validated.subjectId,
      assessment_name: validated.assessmentName,
      marks_obtained: m.marksObtained,
      max_marks: validated.maxMarks,
      faculty_id: validated.facultyProfileId,
      is_published: false,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await (supabase as any)
      .from("internal_marks")
      .upsert(upsertRows, { onConflict: "student_id,subject_id,assessment_name" });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

// 4. Publish assessment marks
export async function publishInternalMarks(params: any) {
  try {
    await assertRole(["faculty"]);
    const validated = publishInternalMarksSchema.parse(params);

    const supabase = await createClient();

    // Find all student ids in this section
    const { data: students } = await (supabase as any)
      .from("students")
      .select("profile_id")
      .eq("section_id", validated.sectionId);

    if (!students || students.length === 0) {
      return { success: false, error: "No students in section" };
    }

    const studentIds = (students as any[]).map((s) => s.profile_id);

    const { error } = await (supabase as any)
      .from("internal_marks")
      .update({ is_published: true })
      .in("student_id", studentIds)
      .eq("subject_id", validated.subjectId)
      .eq("assessment_name", validated.assessmentName);

    if (error) throw error;

    // Notify students that CIE marks are published
    try {
      const { data: subjectData } = await (supabase as any)
        .from("subjects")
        .select("name")
        .eq("id", validated.subjectId)
        .single();

      const subjectName = (subjectData as any)?.name || "Subject";

      await sendNotification({
        userIds: studentIds,
        title: `CIE Marks Published`,
        body: `Continuous Internal Evaluation (CIE) marks for ${subjectName} (${validated.assessmentName}) have been published.`,
        category: "academic",
        link: "/student/internal-marks",
      });
    } catch (err) {
      console.error("Failed to send internal marks notification:", err);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

// 5. Get internal marks for a student
export async function getStudentInternalMarks(studentProfileId: string) {
  try {
    const profile = await assertRole(["student", "faculty", "hod", "admin"]);
    z.string().uuid().parse(studentProfileId);

    if (profile.role === "student" && profile.id !== studentProfileId) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("internal_marks")
      .select(`
        id,
        assessment_name,
        marks_obtained,
        max_marks,
        subject:subjects (
          id,
          name,
          code
        )
      `)
      .eq("student_id", studentProfileId)
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by subject
    const grouped: Record<string, { subjectName: string; subjectCode: string; assessments: any[] }> = {};
    (data as any[]).forEach((row: any) => {
      const sub = row.subject;
      const subId = sub?.id;
      if (!subId) return;

      if (!grouped[subId]) {
        grouped[subId] = {
          subjectName: sub.name,
          subjectCode: sub.code,
          assessments: [],
        };
      }

      grouped[subId].assessments.push({
        id: row.id,
        name: row.assessment_name,
        obtained: Number(row.marks_obtained),
        max: Number(row.max_marks),
      });
    });

    return Object.values(grouped);
  } catch (err) {
    return [];
  }
}

// 6. Get internal marks list already uploaded (for review/edit)
export async function getExistingMarks(subjectId: string, assessmentName: string) {
  try {
    await assertRole(["faculty", "admin"]);
    z.string().uuid().parse(subjectId);
    z.string().min(1).parse(assessmentName);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("internal_marks")
      .select("student_id, marks_obtained, max_marks, is_published")
      .eq("subject_id", subjectId)
      .eq("assessment_name", assessmentName);

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

// 7. Get HOD Department Performance Analytics (Department-wide averages)
export async function getDepartmentPerformance(departmentId: string) {
  try {
    await assertRole(["hod", "admin"]);
    z.string().uuid().parse(departmentId);

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("internal_marks")
      .select(`
        marks_obtained,
        max_marks,
        subject:subjects!inner (
          name,
          code,
          department_id
        )
      `)
      .eq("subjects.department_id", departmentId)
      .eq("is_published", true);

    if (error || !data) throw error;

    const subjectAverages: Record<string, { subjectName: string; subjectCode: string; totalObtained: number; totalMax: number }> = {};
    (data as any[]).forEach((row: any) => {
      const sub = row.subject;
      if (!sub) return;
      const name = sub.name;
      if (!subjectAverages[name]) {
        subjectAverages[name] = {
          subjectName: name,
          subjectCode: sub.code,
          totalObtained: 0,
          totalMax: 0,
        };
      }
      subjectAverages[name].totalObtained += Number(row.marks_obtained);
      subjectAverages[name].totalMax += Number(row.max_marks);
    });

    return Object.values(subjectAverages).map((item) => ({
      name: item.subjectName,
      code: item.subjectCode,
      average: item.totalMax === 0 ? 0 : Math.round((item.totalObtained / item.totalMax) * 100),
    }));
  } catch (err) {
    return [];
  }
}
