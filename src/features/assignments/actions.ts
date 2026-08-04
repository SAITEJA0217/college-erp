"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFacultyAssignments(facultyId: string) {
  try {
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
    return { error: error.message };
  }
}

export async function createAssignment(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subject_id = formData.get("subject_id") as string;
    const faculty_id = formData.get("faculty_id") as string;
    const deadline = formData.get("deadline") as string;
    const max_marks = parseInt(formData.get("max_marks") as string, 10);
    const file = formData.get("file") as File | null;

    let file_url = null;

    if (file && file.size > 0) {
      if (file.size > 50 * 1024 * 1024) return { error: "File exceeds 50MB limit" };
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${faculty_id}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("assignments")
        .upload(filePath, file);

      if (uploadErr) return { error: "Failed to upload assignment file" };

      const { data: publicUrlData } = supabase.storage
        .from("assignments")
        .getPublicUrl(filePath);
        
      file_url = publicUrlData.publicUrl;
    }

    const { error: insertErr } = await (supabase as any)
      .from("assignments")
      .insert({
        subject_id,
        faculty_id,
        title,
        description: description || null,
        deadline,
        max_marks,
        file_url
      });

    if (insertErr) throw insertErr;

    revalidatePath("/faculty/assignments");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getStudentAssignments(studentId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get student's section
    const { data: profile, error: profErr } = await (supabase as any)
      .from("students")
      .select("section_id, sections(semester_id)")
      .eq("profile_id", studentId)
      .single();
      
    if (profErr || !profile?.sections?.semester_id) return { error: "Could not determine enrolled subjects" };
    
    const semesterId = profile.sections.semester_id;

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
    return { error: error.message };
  }
}

export async function submitAssignment(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const assignment_id = formData.get("assignment_id") as string;
    const student_id = formData.get("student_id") as string;
    const file = formData.get("file") as File;

    if (!file || file.size === 0) return { error: "No file provided" };
    if (file.size > 50 * 1024 * 1024) return { error: "File exceeds 50MB limit" };

    // Validate Deadline
    const { data: assignment, error: assignErr } = await (supabase as any)
      .from("assignments")
      .select("deadline")
      .eq("id", assignment_id)
      .single();

    if (assignErr || !assignment) return { error: "Assignment not found" };
    
    if (new Date() > new Date(assignment.deadline)) {
      return { error: "The deadline for this assignment has passed. Late submissions are not allowed." };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${student_id}/${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from("submissions")
      .upload(filePath, file, { upsert: true });

    if (uploadErr) return { error: "Failed to upload submission file" };

    // Get signed URL that expires in 100 years for simplicity, 
    // or just public URL if the bucket is configured for it. 
    // We configured it as private, so we should store the path and generate signedURLs on demand, 
    // but for simplicity in this MVP, we will store the path.
    
    // Check if submission exists to update vs insert
    const { data: existingSub } = await (supabase as any)
      .from("assignment_submissions")
      .select("id")
      .eq("assignment_id", assignment_id)
      .eq("student_id", student_id)
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
          assignment_id,
          student_id,
          file_url: filePath
        });
    }

    revalidatePath("/student/assignments");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getSubmissionSignedUrl(filePath: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("submissions")
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) throw error;
    return { url: data.signedUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function gradeSubmission(submissionId: string, marks: number, feedback: string) {
  try {
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("assignment_submissions")
      .update({
        marks_obtained: marks,
        feedback: feedback || null
      })
      .eq("id", submissionId);

    if (error) throw error;
    
    // We should ideally pass the assignment ID to revalidate just that page
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
