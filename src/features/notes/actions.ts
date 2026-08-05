"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().max(1000).optional().nullable(),
  unit: z.string().trim().max(50).optional().nullable(),
  subject_id: z.string().uuid("Invalid subject reference"),
  faculty_id: z.string().uuid("Invalid faculty reference"),
  resource_type: z.string().trim().min(1, "Resource type is required"),
  url: z.string().trim().optional().nullable(),
});

const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "png", "jpg", "jpeg", "csv"];

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "This study note already exists.";
  if (err.code === "23503") return "Invalid subject or faculty reference keys.";
  return err.message || "Failed to process coursework operation.";
}

export async function getFacultySubjects(facultyId: string) {
  try {
    const profile = await assertRole(["faculty", "admin"]);
    if (profile.role === "faculty" && profile.id !== facultyId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faculty_class_assignments")
      .select(`
        subject_id,
        subject:subjects (
          id,
          name,
          code
        )
      `)
      .eq("faculty_profile_id", facultyId)
      .eq("is_archived", false);

    if (error) throw error;
    
    // Deduplicate subjects
    const subjectMap = new Map();
    (data || []).forEach((a: any) => {
      const sub = a.subject;
      if (sub) {
        subjectMap.set(a.subject_id, sub);
      }
    });

    return { data: Array.from(subjectMap.values()) };
  } catch (error: any) {
    return { error: error.message || "Failed to load subjects" };
  }
}

export async function getNotesForFaculty(facultyId: string) {
  try {
    const profile = await assertRole(["faculty", "admin"]);
    if (profile.role === "faculty" && profile.id !== facultyId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notes")
      .select(`
        id,
        title,
        description,
        unit,
        resource_type,
        url,
        created_at,
        subject_id,
        subjects (
          name,
          code
        )
      `)
      .eq("faculty_id", facultyId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    const mapped = (data as any[]).map(n => ({
      ...n,
      subject_name: n.subjects?.name || "Unknown",
      subject_code: n.subjects?.code || "N/A",
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message || "Failed to load notes" };
  }
}

export async function getStudentNotes(studentId: string) {
  try {
    const profile = await assertRole(["student", "faculty", "admin"]);
    if (profile.role === "student" && profile.id !== studentId) {
      return { error: "Forbidden: Access denied." };
    }

    const supabase = await createClient();
    
    // 1. Get student's semester_id directly from the students table
    const { data: student, error: studentErr } = await (supabase as any)
      .from("students")
      .select("semester_id, section_id, department_id")
      .eq("profile_id", studentId)
      .single();

    if (studentErr || !student) return { error: "Student record not found" };
    if (!student.semester_id) return { error: "Student has no semester assigned" };
    
    const semesterId = student.semester_id;

    // 2. Get all notes for subjects belonging to that semester
    const { data: notes, error: notesErr } = await (supabase as any)
      .from("notes")
      .select(`
        id,
        title,
        description,
        unit,
        resource_type,
        url,
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
        )
      `)
      .eq("subjects.semester_id", semesterId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (notesErr) throw notesErr;

    const mapped = (notes as any[]).map(n => ({
      id: n.id,
      title: n.title,
      description: n.description,
      unit: n.unit,
      resource_type: n.resource_type,
      url: n.url,
      created_at: n.created_at,
      subject_id: n.subject_id,
      subject_name: n.subjects?.name,
      subject_code: n.subjects?.code,
      faculty_name: n.faculty?.profiles?.full_name || "Unknown Faculty",
    }));

    return { data: mapped };
  } catch (error: any) {
    return { error: error.message || "Failed to load notes" };
  }
}

export async function createNote(formData: FormData) {
  try {
    const profile = await assertRole(["faculty"]);

    const rawValues = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      unit: formData.get("unit") as string,
      subject_id: formData.get("subject_id") as string,
      faculty_id: formData.get("faculty_id") as string,
      resource_type: formData.get("resource_type") as string,
      url: formData.get("url") as string,
    };

    const validated = noteSchema.parse(rawValues);

    if (profile.id !== validated.faculty_id) {
      return { error: "Forbidden: Faculty ID mismatch." };
    }

    const file = formData.get("file") as File | null;
    let finalUrl = validated.url;
    const supabase = await createClient();

    // If a physical file is provided, upload it to Supabase Storage
    if (file && file.size > 0 && !["link", "youtube"].includes(validated.resource_type)) {
      if (file.size > 50 * 1024 * 1024) {
        return { error: "File exceeds 50MB limit" };
      }
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        return { error: `Unsupported file type. Allowed formats: ${allowedExtensions.join(", ")}` };
      }

      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${validated.faculty_id}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("study_materials")
        .upload(filePath, file, { upsert: false });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("study_materials")
        .getPublicUrl(filePath);
        
      finalUrl = publicUrlData.publicUrl;
    }

    if (!finalUrl) {
      return { error: "No file or valid URL link provided" };
    }

    const { error: insertErr } = await (supabase as any)
      .from("notes")
      .insert({
        subject_id: validated.subject_id,
        faculty_id: validated.faculty_id,
        title: validated.title,
        description: validated.description || null,
        unit: validated.unit || null,
        resource_type: validated.resource_type,
        url: finalUrl,
      });

    if (insertErr) throw insertErr;

    // Notify students
    try {
      const { data: timetables } = await (supabase as any)
        .from("faculty_class_assignments")
        .select("section_id")
        .eq("subject_id", validated.subject_id)
        .eq("is_archived", false);
        
      if (timetables && timetables.length > 0) {
        const sectionIds = Array.from(new Set(timetables.map((t: any) => t.section_id)));
        const { data: students } = await (supabase as any)
          .from("students")
          .select("profile_id")
          .in("section_id", sectionIds);
          
        if (students && students.length > 0) {
          const studentIds = students.map((s: any) => s.profile_id);
          await sendNotification({
            userIds: studentIds,
            title: "New Study Material Uploaded",
            body: `A new ${validated.resource_type} has been uploaded: ${validated.title}`,
            category: "academic",
            link: "/student/notes"
          });
        }
      }
    } catch (err) {
      console.error("Failed to send note notifications:", err);
    }

    revalidatePath("/faculty/notes");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function deleteNote(id: string) {
  try {
    await assertRole(["faculty"]);
    z.string().uuid().parse(id);

    const supabase = await createClient();
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
    revalidatePath("/faculty/notes");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}
