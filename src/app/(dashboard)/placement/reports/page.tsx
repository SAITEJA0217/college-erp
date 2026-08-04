import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getPlacementKPIs, getPlacements, getPlacementApplications } from "@/features/placement/actions";
import { ReportsClient } from "./client";
import { createClient } from "@/lib/supabase/server";

export default async function PlacementReportsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "placement") {
    redirect("/login");
  }

  // Fetch complex data for reports (e.g. placements by department)
  // We can do this efficiently using Supabase RPC or just grouping here
  const supabase = await createClient();
  const { data: appsData } = await supabase
    .from("placement_applications")
    .select(`
      status,
      students!inner(
        departments(name)
      )
    `)
    .eq("status", "selected");
  
  // Aggregate data by department
  const deptCount: Record<string, number> = {};
  appsData?.forEach((app: any) => {
    const deptName = app.students.departments?.name || "Unknown";
    deptCount[deptName] = (deptCount[deptName] || 0) + 1;
  });

  const chartData = Object.keys(deptCount).map(key => ({
    department: key,
    students: deptCount[key]
  }));

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Placement Reports</h2>
      </div>
      
      <ReportsClient chartData={chartData} />
    </div>
  );
}
