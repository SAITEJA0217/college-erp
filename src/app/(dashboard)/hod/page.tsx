import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import {
  getDepartmentKPIs,
  getAttendanceTrends,
  getDepartmentAnnouncements,
  getFacultyAnalytics,
  getStudentPerformanceAnalytics
} from "@/features/hod/actions";
import { HodDashboardClient } from "./client";
import { createClient } from "@/lib/supabase/server";

export default async function HodDashboardPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "hod") redirect("/login");

  const supabase = await createClient();
  const { data: facultyData } = await (supabase as any)
    .from("faculty")
    .select("department_id")
    .eq("profile_id", profile.id)
    .single();

  if (!facultyData?.department_id) {
    return <div className="p-8 text-muted-foreground">No department assigned to your profile.</div>;
  }

  const deptId = facultyData.department_id;

  const [kpisRes, trendsRes, noticesRes, facultyRes, perfRes] = await Promise.all([
    getDepartmentKPIs(deptId),
    getAttendanceTrends(deptId),
    getDepartmentAnnouncements(deptId),
    getFacultyAnalytics(deptId),
    getStudentPerformanceAnalytics(deptId),
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Department Analytics</h2>
          <p className="text-muted-foreground mt-1">Real-time overview of your department's performance.</p>
        </div>
      </div>

      <HodDashboardClient
        kpis={kpisRes}
        trends={trendsRes}
        notices={noticesRes}
        facultyWorkload={facultyRes.facultyWorkload}
        sectionData={perfRes.sectionData}
        avgMarks={perfRes.avgMarks}
      />
    </div>
  );
}
