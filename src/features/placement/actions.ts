"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/features/notifications/actions";

export async function getPlacements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("placements")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getPlacementDetails(placementId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("placements")
    .select("*")
    .eq("id", placementId)
    .single();
  return { data, error };
}

export async function createPlacement(placementData: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("placements")
    .insert(placementData);
  
  if (error) return { error: error.message };

  try {
    const minCgpa = placementData.eligibility_cgpa || 0;
    const { data: students } = await supabase
      .from("students")
      .select("profile_id")
      .gte("current_cgpa", minCgpa);

    if (students && students.length > 0) {
      await sendNotification({
        userIds: students.map((s: any) => s.profile_id),
        title: "New Placement Drive",
        body: `${placementData.company_name} is hiring for ${placementData.job_role}! Apply now.`,
        category: "placement",
        link: "/student/placements"
      });
    }
  } catch (err) {
    console.error("Failed to notify students about drive", err);
  }

  revalidatePath("/placement/drives");
  return { success: true };
}

export async function getPlacementApplications(placementId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("placement_applications")
    .select(`
      id,
      status,
      applied_at,
      resume_url,
      student_id,
      students (
        current_cgpa,
        users ( full_name, email, phone )
      )
    `)
    .eq("placement_id", placementId)
    .order("applied_at", { ascending: false });
  return { data, error };
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("placement_applications")
    .update({ status })
    .eq("id", applicationId);
  
  if (error) return { error: error.message };
  revalidatePath("/placement/applications");
  return { success: true };
}

export async function getStudentPlacements(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("placements")
    .select(`
      *,
      placement_applications (
        id, status, applied_at, resume_url
      )
    `)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  // Filter so we only get the application for this specific student if it exists
  const mappedData = data?.map((p: any) => ({
    ...p,
    application: p.placement_applications.find((a: any) => a.student_id === studentId) || null
  }));

  return { data: mappedData, error };
}

export async function applyToPlacement(placementId: string, studentId: string, resumeUrl: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("placement_applications")
    .insert({
      placement_id: placementId,
      student_id: studentId,
      resume_url: resumeUrl,
      status: "applied"
    });
  
  if (error) return { error: error.message };
  revalidatePath("/student/placements");
  return { success: true };
}

export async function getPlacementKPIs() {
  const supabase = await createClient();
  
  const { count: activeDrives } = await supabase
    .from("placements")
    .select("*", { count: "exact", head: true })
    .eq("is_archived", false);

  const { count: totalApplications } = await supabase
    .from("placement_applications")
    .select("*", { count: "exact", head: true });

  const { count: selectedStudents } = await supabase
    .from("placement_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "selected");

  return {
    activeDrives: activeDrives || 0,
    totalApplications: totalApplications || 0,
    selectedStudents: selectedStudents || 0
  };
}

export async function getPlacementAnalyticsCharts() {
  const supabase = await createClient();

  // Applications per drive (top 8)
  const { data: drives } = await supabase
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
  const { data: allApps } = await supabase
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
  const { data: drivesAll } = await supabase
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
}

