"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const createAssignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().max(1000).optional().nullable(),
  subject_id: z.string().uuid("Invalid subject reference"),
  faculty_id: z.string().uuid("Invalid faculty reference"),
  deadline: z.string().min(1, "Deadline is required"),
  max_marks: z.number().int().min(1, "Maximum marks must be at least 1").max(100),
});

const submitAssignmentSchema = z.object({
  assignment_id: z.string().uuid("Invalid assignment reference"),
  student_id: z.string().uuid("Invalid student reference"),
});

const gradeSubmissionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission reference"),
  marks: z.number().min(0, "Marks cannot be negative").max(100, "Marks cannot exceed 100"),
  feedback: z.string().trim().max(500).optional().nullable(),
});

const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "png", "jpg", "jpeg", "csv"];

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This record already exists.";
  if (err.code === "23503") return "Invalid related reference keys.";
  return err.message || "Failed to process assignment action.";
}

export async function getFacultyAssignments(facultyId: string) {
  try {
    const profile = await assertRole(["faculty", "admin"]);
    if (profile.role === "faculty" && profile.id !== facultyId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("assignments")
      .select(`
        id,
        title,
        description,
        deadline,
        max_marks,
        file_url,
        created_at,
        subject_id,
        subjects (
          name,
          code
        ),
        assignment_submissions (
          id
        )
      `)
      .eq("faculty_id", facultyId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (data as any[]).map(a => ({
      ...a,
      subject_name: a.subjects?.name,
      subject_code: a.subjects?.code,
      submissions_count: a.assignment_submissions?.length || 0,
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message || "Failed to load assignments" };
  }
}

export async function createAssignment(formData: FormData) {
  try {
    const profile = await assertRole(["faculty"]);

    const rawValues = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      subject_id: formData.get("subject_id") as string,
      faculty_id: formData.get("faculty_id") as string,
      deadline: formData.get("deadline") as string,
      max_marks: parseInt(formData.get("max_marks") as string, 10),
    };

    const validated = createAssignmentSchema.parse(rawValues);

    if (profile.id !== validated.faculty_id) {
      return { error: "Forbidden: Faculty ID mismatch." };
    }

    const file = formData.get("file") as File | null;
    let file_url = null;
    const supabase = await createClient();

    if (file && file.size > 0) {
      if (file.size > 50 * 1024 * 1024) return { error: "File exceeds 50MB limit" };
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        return { error: `Unsupported file type. Allowed formats: ${allowedExtensions.join(", ")}` };
      }

      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${validated.faculty_id}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("assignments")
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from("assignments")
        .getPublicUrl(filePath);
        
      file_url = publicUrlData.publicUrl;
    }

    const { error: insertErr } = await (supabase as any)
      .from("assignments")
      .insert({
        subject_id: validated.subject_id,
        faculty_id: validated.faculty_id,
        title: validated.title,
        description: validated.description || null,
        deadline: validated.deadline,
        max_marks: validated.max_marks,
        file_url
      });

    if (insertErr) throw insertErr;

    // Notify students in the subject's section
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
            title: `New Assignment Published`,
            body: `Assignment "${validated.title}" has been published for ${(subjectData as any).name}.`,
            category: "academic",
            link: "/student/assignments",
          });
        }
      }
    } catch (err) {
      console.error("Failed to send assignment notifications:", err);
    }

    revalidatePath("/faculty/assignments");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function getStudentAssignments(studentId: string) {
  try {
    const profile = await assertRole(["student", "faculty", "admin"]);
    if (profile.role === "student" && profile.id !== studentId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    
    // 1. Get student's semester_id directly from the students table
    const { data: student, error: profErr } = await (supabase as any)
      .from("students")
      .select("semester_id")
      .eq("profile_id", studentId)
      .single();
      
    if (profErr || !student?.semester_id) return { error: "Could not determine enrolled subjects" };
    
    const semesterId = student.semester_id;

    // 2. Get all assignments for subjects belonging to that semester
    const { data: assignments, error: assignErr } = await (supabase as any)
      .from("assignments")
      .select(`
        id,
        title,
        description,
        deadline,
        max_marks,
        file_url,
        created_at,
        subject_id,
        faculty_id,
        subjects!inner (
          id,
          name,
          code,
          semester_id
        ),
        faculty (
          profiles (
            full_name
          )
        ),
        assignment_submissions (
          id,
          student_id,
          file_url,
          submitted_at,
          marks_obtained,
          feedback
        )
      `)
      .eq("subjects.semester_id", semesterId)
      .eq("is_archived", false)
      .order("deadline", { ascending: true });

    if (assignErr) throw assignErr;

    const mapped = (assignments as any[]).map(a => {
      // Filter submissions to only the current student
      const mySub = a.assignment_submissions?.find((s: any) => s.student_id === studentId) || null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        deadline: a.deadline,
        max_marks: a.max_marks,
        file_url: a.file_url,
        subject_name: a.subjects?.name,
        subject_code: a.subjects?.code,
        faculty_name: a.faculty?.profiles?.full_name || "Unknown Faculty",
        submission: mySub
      };
    });

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message || "Failed to load assignments" };
  }
}

export async function submitAssignment(formData: FormData) {
  try {
    const profile = await assertRole(["student"]);

    const rawValues = {
      assignment_id: formData.get("assignment_id") as string,
      student_id: formData.get("student_id") as string,
    };

    const validated = submitAssignmentSchema.parse(rawValues);

    if (profile.id !== validated.student_id) {
      return { error: "Forbidden: Student ID mismatch." };
    }

    const file = formData.get("file") as File;
    if (!file || file.size === 0) return { error: "No file provided" };
    if (file.size > 50 * 1024 * 1024) return { error: "File exceeds 50MB limit" };

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return { error: `Unsupported file type. Allowed formats: ${allowedExtensions.join(", ")}` };
    }

    const supabase = await createClient();

    // Validate Deadline
    const { data: assignment, error: assignErr } = await (supabase as any)
      .from("assignments")
      .select("deadline")
      .eq("id", validated.assignment_id)
      .single();

    if (assignErr || !assignment) return { error: "Assignment not found" };
    
    if (new Date() > new Date(assignment.deadline)) {
      return { error: "The deadline for this assignment has passed. Late submissions are not allowed." };
    }

    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${validated.student_id}/${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from("submissions")
      .upload(filePath, file, { upsert: true });

    if (uploadErr) throw uploadErr;

    // Check if submission exists to update vs insert
    const { data: existingSub } = await (supabase as any)
      .from("assignment_submissions")
      .select("id")
      .eq("assignment_id", validated.assignment_id)
      .eq("student_id", validated.student_id)
      .single();

    if (existingSub) {
      await (supabase as any)
        .from("assignment_submissions")
        .update({
          file_url: filePath,
          submitted_at: new Date().toISOString()
        })
        .eq("id", existingSub.id);
    } else {
      await (supabase as any)
        .from("assignment_submissions")
        .insert({
          assignment_id: validated.assignment_id,
          student_id: validated.student_id,
          file_url: filePath
        });
    }

    revalidatePath("/student/assignments");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function getSubmissionSignedUrl(filePath: string) {
  try {
    await assertRole(["faculty", "student", "admin"]);
    z.string().min(1).parse(filePath);

    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("submissions")
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) throw error;
    return { url: data.signedUrl };
  } catch (error: any) {
    return { error: error.message || "Failed to generate file link" };
  }
}

export async function gradeSubmission(submissionId: string, marks: number, feedback: string) {
  try {
    await assertRole(["faculty"]);
    const validated = gradeSubmissionSchema.parse({ submissionId, marks, feedback });

    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("assignment_submissions")
      .update({
        marks_obtained: validated.marks,
        feedback: validated.feedback || null
      })
      .eq("id", validated.submissionId);

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}
