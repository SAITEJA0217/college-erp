"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";
import { assertRole } from "@/features/auth/user";
import { z } from "zod";

const createPlacementSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required").max(100),
  job_role: z.string().trim().min(1, "Job role is required").max(100),
  eligibility_cgpa: z.number().min(0, "CGPA cannot be negative").max(10, "CGPA cannot exceed 10"),
  package_lpa: z.number().min(0, "Package cannot be negative").max(100),
  deadline: z.string().min(1, "Deadline is required"),
  description: z.string().trim().max(1000).optional().nullable(),
});

const updateApplicationStatusSchema = z.object({
  applicationId: z.string().uuid("Invalid application reference"),
  status: z.enum(["applied", "shortlisted", "selected", "rejected"]),
});

const applyToPlacementSchema = z.object({
  placementId: z.string().uuid("Invalid placement reference"),
  studentId: z.string().uuid("Invalid student reference"),
  resumeUrl: z.string().url("Invalid resume link URL"),
});

function getFriendlyErrorMessage(err: any): string {
  if (err.code === "23505") return "You have already applied for this placement drive.";
  if (err.code === "23503") return "Invalid placement or student reference keys.";
  return err.message || "Failed to process placement operation.";
}

export async function getPlacements() {
  try {
    await assertRole(["student", "placement", "admin"]);
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("placements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Failed to load placements" };
  }
}

export async function getPlacementDetails(placementId: string) {
  try {
    await assertRole(["student", "placement", "admin"]);
    z.string().uuid().parse(placementId);

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("placements")
      .select("*")
      .eq("id", placementId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Failed to load drive details" };
  }
}

export async function createPlacement(placementData: any) {
  try {
    await assertRole(["placement"]);
    const validated = createPlacementSchema.parse(placementData);
    const supabase = await createClient();

    const { error } = await (supabase as any)
      .from("placements")
      .insert({
        company_name: validated.company_name,
        job_role: validated.job_role,
        eligibility_cgpa: validated.eligibility_cgpa,
        package_lpa: validated.package_lpa,
        deadline: validated.deadline,
        description: validated.description || null,
      });
    
    if (error) throw error;

    try {
      const minCgpa = validated.eligibility_cgpa || 0;
      const { data: students } = await (supabase as any)
        .from("students")
        .select("profile_id")
        .gte("current_cgpa", minCgpa);

      if (students && students.length > 0) {
        await sendNotification({
          userIds: students.map((s: any) => s.profile_id),
          title: "New Placement Drive",
          body: `${validated.company_name} is hiring for ${validated.job_role}! Apply now.`,
          category: "placement",
          link: "/student/placements"
        });
      }
    } catch (err) {
      console.error("Failed to notify students about drive", err);
    }

    revalidatePath("/placement/drives");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

export async function getPlacementApplications(placementId: string) {
  try {
    await assertRole(["placement"]);
    z.string().uuid().parse(placementId);

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("placement_applications")
      .select(`
        id,
        status,
        applied_at,
        resume_url,
        student_id,
        students (
          current_cgpa,
          profiles ( full_name, email, phone )
        )
      `)
      .eq("placement_id", placementId)
      .order("applied_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Failed to load applications" };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    await assertRole(["placement"]);
    const validated = updateApplicationStatusSchema.parse({ applicationId, status });

    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("placement_applications")
      .update({ status: validated.status })
      .eq("id", validated.applicationId);
    
    if (error) throw error;

    revalidatePath("/placement/applications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

export async function getStudentPlacements(studentId: string) {
  try {
    const profile = await assertRole(["student", "placement", "admin"]);
    z.string().uuid().parse(studentId);

    if (profile.role === "student" && profile.id !== studentId) {
      return { data: [], error: "Forbidden" };
    }

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("placements")
      .select(`
        *,
        placement_applications (
          id, status, applied_at, resume_url, student_id
        )
      `)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filter so we only get the application for this specific student if it exists
    const mappedData = (data || [])?.map((p: any) => ({
      ...p,
      application: p.placement_applications?.find((a: any) => a.student_id === studentId) || null
    }));

    return { data: mappedData, error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Failed to load placements roster" };
  }
}

export async function applyToPlacement(placementId: string, studentId: string, resumeUrl: string) {
  try {
    const profile = await assertRole(["student"]);
    const validated = applyToPlacementSchema.parse({ placementId, studentId, resumeUrl });

    if (profile.id !== validated.studentId) {
      return { error: "Forbidden: You cannot apply on behalf of another student." };
    }

    const supabase = await createClient();

    // Check CGPA eligibility
    const [
      { data: drive, error: driveErr },
      { data: student, error: studentErr }
    ] = await Promise.all([
      (supabase as any).from("placements").select("eligibility_cgpa, deadline").eq("id", validated.placementId).single(),
      (supabase as any).from("students").select("current_cgpa").eq("profile_id", validated.studentId).single()
    ]);

    if (driveErr || !drive) return { error: "Placement drive not found." };
    if (studentErr || !student) return { error: "Student profile not found." };

    if (new Date() > new Date((drive as any).deadline)) {
      return { error: "The application deadline for this drive has passed." };
    }

    if (Number((student as any).current_cgpa) < Number((drive as any).eligibility_cgpa)) {
      return { error: `Ineligible: Your CGPA (${(student as any).current_cgpa}) does not meet the minimum eligibility requirement (${(drive as any).eligibility_cgpa}).` };
    }

    const { error } = await (supabase as any)
      .from("placement_applications")
      .insert({
        placement_id: validated.placementId,
        student_id: validated.studentId,
        resume_url: validated.resumeUrl,
        status: "applied"
      });
    
    if (error) throw error;

    revalidatePath("/student/placements");
    return { success: true };
  } catch (error: any) {
    return { error: getFriendlyErrorMessage(error) };
  }
}

export async function getPlacementKPIs() {
  try {
    await assertRole(["placement", "admin"]);
    const supabase = await createClient();
    
    const { count: activeDrives } = await (supabase as any)
      .from("placements")
      .select("*", { count: "exact", head: true })
      .eq("is_archived", false);

    const { count: totalApplications } = await (supabase as any)
      .from("placement_applications")
      .select("*", { count: "exact", head: true });

    const { count: selectedStudents } = await (supabase as any)
      .from("placement_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "selected");

    return {
      activeDrives: activeDrives || 0,
      totalApplications: totalApplications || 0,
      selectedStudents: selectedStudents || 0
    };
  } catch (err) {
    return { activeDrives: 0, totalApplications: 0, selectedStudents: 0 };
  }
}

export async function getPlacementAnalyticsCharts() {
  try {
    await assertRole(["placement", "admin"]);
    const supabase = await createClient();

    // Applications per drive (top 8)
    const { data: drives } = await (supabase as any)
      .from("placements")
      .select(`
        id,
        company_name,
        job_role,
        placement_applications ( id, status )
      `)
      .order("created_at", { ascending: false })
      .limit(8);

    const driveApplications = (drives as any[])?.map((d) => ({
      company: d.company_name.length > 12 ? d.company_name.slice(0, 12) + "…" : d.company_name,
      applications: d.placement_applications?.length || 0,
      selected: d.placement_applications?.filter((a: any) => a.status === "selected").length || 0,
    })) || [];

    // Status distribution
    const { data: allApps } = await (supabase as any)
      .from("placement_applications")
      .select("status");

    const statusCounts: Record<string, number> = {};
    (allApps as any[])?.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    const COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
    const statusDistribution = Object.entries(statusCounts).map(([status, value], i) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      value,
      fill: COLORS[i % COLORS.length]
    }));

    // Monthly drive trend (last 6 months)
    const { data: drivesAll } = await (supabase as any)
      .from("placements")
      .select("created_at")
      .order("created_at", { ascending: false });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts: Record<string, number> = {};
    (drivesAll as any[])?.forEach((d) => {
      const m = months[new Date(d.created_at).getMonth()];
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const currentMonth = new Date().getMonth();
    const driveTrend = Array.from({ length: 6 }).map((_, i) => {
      const m = (currentMonth - 5 + i + 12) % 12;
      return { month: months[m], drives: monthCounts[months[m]] || 0 };
    });

    return { driveApplications, statusDistribution, driveTrend };
  } catch (err) {
    return { driveApplications: [], statusDistribution: [], driveTrend: [] };
  }
}
