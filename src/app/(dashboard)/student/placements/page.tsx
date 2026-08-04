import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentPlacements } from "@/features/placement/actions";
import { StudentPlacementsClient } from "./client";

export default async function StudentPlacementsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data: placements } = await getStudentPlacements(profile.id);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Campus Placements</h2>
      </div>
      
      <StudentPlacementsClient 
        placements={placements || []}
        studentId={profile.id}
      />
    </div>
  );
}
