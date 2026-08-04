import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getAssignedSubjects } from "@/features/attendance/faculty-actions";
import { AttendanceClient } from "./client";

export default async function FacultyAttendancePage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  const { data: assignedSubjects, error } = await getAssignedSubjects();

  if (error) {
    return <div className="p-8 text-destructive">Failed to load subjects: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground">Select a class and date to mark or edit attendance.</p>
      </div>

      <AttendanceClient initialSubjects={assignedSubjects || []} />
    </div>
  );
}
