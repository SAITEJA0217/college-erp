import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getFacultyClasses } from "@/features/internal-marks/actions";
import { FacultyInternalMarksClient } from "./client";

export default async function FacultyInternalMarksPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  const classesList = await getFacultyClasses(profile.id);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Internal Assessment Marks</h2>
          <p className="text-muted-foreground mt-1">
            Record, update, and publish students continuous internal evaluation (CIE) grades.
          </p>
        </div>
      </div>

      <FacultyInternalMarksClient classesList={classesList} facultyId={profile.id} />
    </div>
  );
}
