"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  // Basic Counts
  const results = await Promise.all([
    (supabase as any).from("students").select("*", { count: "exact", head: true }),
    (supabase as any).from("faculty").select("*", { count: "exact", head: true }),
    (supabase as any).from("departments").select("*", { count: "exact", head: true }),
    (supabase as any).from("assignments").select("*", { count: "exact", head: true }),
    (supabase as any).from("notifications").select("id, title, body, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const studentCount = results[0].count;
  const facultyCount = results[1].count;
  const deptCount = results[2].count;
  const assignmentCount = results[3].count;
  const recentNotifications = results[4]?.data || [];


  // Students by Department
  const { data: deptData } = await (supabase as any)
    .from("departments")
    .select(`
      code,
      name,
      programs (
        sections (
          students ( profile_id )
        )
      )
    `);

  const studentsByDept = deptData?.map((dept: any) => {
    let count = 0;
    dept.programs?.forEach((p: any) => {
      p.sections?.forEach((sec: any) => {
        count += sec.students?.length || 0;
      });
    });
    return { name: dept.code, count };
  }) || [];

  // Attendance Overall
  const { data: attendance } = await (supabase as any)
    .from("attendance_records")
    .select("status");
    
  let present = 0;
  let totalAtt = 0;
  attendance?.forEach((a: any) => {
    totalAtt++;
    if (a.status === "present") present++;
  });
  
  const overallAttendance = totalAtt === 0 ? 0 : Math.round((present / totalAtt) * 100);

  // Placement Performance
  const { data: apps } = await (supabase as any)
    .from("placement_applications")
    .select("status");
    
  const placementData = [
    { status: "Applied", value: 0 },
    { status: "Shortlisted", value: 0 },
    { status: "Interviewed", value: 0 },
    { status: "Selected", value: 0 },
    { status: "Rejected", value: 0 }
  ];
  
  apps?.forEach((app: any) => {
    const statusMap: any = {
      applied: 0,
      shortlisted: 1,
      interviewed: 2,
      selected: 3,
      rejected: 4
    };
    const idx = statusMap[app.status] ?? 0;
    placementData[idx].value++;
  });

  // Generate Mock Revenue (last 6 months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const revenueData = Array.from({ length: 6 }).map((_, i) => {
    const m = (currentMonth - 5 + i + 12) % 12;
    return {
      month: months[m],
      revenue: Math.floor(Math.random() * (1500000 - 800000) + 800000) // 8L to 15L
    };
  });
  
  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);

  return {
    metrics: {
      totalStudents: studentCount || 0,
      totalFaculty: facultyCount || 0,
      totalDepartments: deptCount || 0,
      totalAssignments: assignmentCount || 0,
      overallAttendance,
      totalRevenue
    },
    charts: {
      studentsByDept,
      placementData: placementData.filter(d => d.value > 0),
      revenueData
    },
    recentNotifications
  };
}
