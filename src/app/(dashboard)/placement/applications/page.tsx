import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getPlacements, getPlacementApplications } from "@/features/placement/actions";
import { ApplicationsClient } from "./client";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ driveId?: string }> }) {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "placement") {
    redirect("/login");
  }

  const { driveId } = await searchParams;
  const { data: drives } = await getPlacements();
  
  let applications: any[] = [];
  if (driveId) {
    const res = await getPlacementApplications(driveId);
    applications = res.data || [];
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Applications</h2>
      </div>
      
      <ApplicationsClient 
        drives={drives || []} 
        initialApplications={applications}
        selectedDriveId={driveId}
      />
    </div>
  );
}
