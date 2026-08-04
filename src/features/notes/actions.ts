"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";

export async function getFacultySubjects(facultyId: string) {
  try {
    const supabase = await createClient();
    // A faculty member is assigned to subjects via timetables OR faculty_assignments (we'll use faculty_assignments)
    const { data, error } = await supabase
      .from("faculty_assignments")
      .select(`
        subject_id,
        subjects (
          id,
          name,
          code
        )
      `)
      .eq("faculty_id", facultyId)
      .eq("is_archived", false);

    if (error) throw error;
    
    // Deduplicate subjects
    const subjectMap = new Map();
    data.forEach((a: any) => {
      if (a.subjects) {
        subjectMap.set(a.subject_id, a.subjects);
      }
    });

    return { data: Array.from(subjectMap.values()) };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getNotesForFaculty(facultyId: string) {
  try {
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
    return { error: error.message };
  }
}

export async function getStudentNotes(studentId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get student's section
    const { data: profile, error: profErr } = await (supabase as any)
      .from("students")
      .select(`
        section_id,
        sections (
          semester_id
        )
      `)
      .eq("profile_id", studentId)
      .single();
      
    if (profErr || !profile?.sections?.semester_id) return { error: "Could not determine enrolled subjects" };
    
    const semesterId = profile.sections.semester_id;

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
    return { error: error.message };
  }
}

export async function createNote(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const unit = formData.get("unit") as string;
    const subject_id = formData.get("subject_id") as string;
    const faculty_id = formData.get("faculty_id") as string;
    const resource_type = formData.get("resource_type") as string;
    const url = formData.get("url") as string; // if link/youtube
    const file = formData.get("file") as File | null;

    let finalUrl = url;

    // If a physical file is provided, upload it to Supabase Storage
    if (file && file.size > 0 && !["link", "youtube"].includes(resource_type)) {
      if (file.size > 50 * 1024 * 1024) {
        return { error: "File exceeds 50MB limit" };
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${faculty_id}/${fileName}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("study_materials")
        .upload(filePath, file, { upsert: false });

      if (uploadErr) {
        console.error("Storage error:", uploadErr);
        return { error: "Failed to upload file to storage" };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("study_materials")
        .getPublicUrl(filePath);
        
      finalUrl = publicUrlData.publicUrl;
    }

    if (!finalUrl) {
      return { error: "No file or valid URL provided" };
    }

    const { error: insertErr } = await (supabase as any)
      .from("notes")
      .insert({
        subject_id,
        faculty_id,
        title,
        description: description || null,
        unit: unit || null,
        resource_type,
        url: finalUrl,
      });

    if (insertErr) throw insertErr;

    // Notify students
    try {
      const { data: timetables } = await (supabase as any)
        .from("timetables")
        .select("section_id")
        .eq("subject_id", subject_id);
        
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
            body: `A new ${resource_type} has been uploaded: ${title}`,
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
    console.error("Server action error:", error);
    return { error: error.message };
  }
}

export async function deleteNote(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
    revalidatePath("/faculty/notes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
