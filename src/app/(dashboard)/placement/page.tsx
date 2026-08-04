import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getPlacementKPIs, getPlacements, getPlacementAnalyticsCharts } from "@/features/placement/actions";
import { PlacementDashboardClient } from "./client";

export default async function PlacementDashboardPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "placement") redirect("/login");

  const [kpis, { data: drives }, charts] = await Promise.all([
    getPlacementKPIs(),
    getPlacements(),
    getPlacementAnalyticsCharts(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Placement Analytics</h2>
        <p className="text-muted-foreground mt-1">Comprehensive placement and recruitment performance overview.</p>
      </div>

      <PlacementDashboardClient
        kpis={kpis}
        drives={drives?.slice(0, 5) || []}
        charts={charts}
      />
    </div>
  );
}
