import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getPlacements } from "@/features/placement/actions";
import { DrivesClient } from "./client";

export default async function DrivesPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "placement") {
    redirect("/login");
  }

  const { data: drives } = await getPlacements();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Campus Drives</h2>
      </div>
      
      <DrivesClient initialDrives={drives || []} />
    </div>
  );
}
