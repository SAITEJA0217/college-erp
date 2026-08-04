import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentTimetable } from "@/features/timetable/actions";
import { TimetableViewer, TimetableEvent } from "@/components/timetable/timetable-viewer";

export default async function StudentTimetablePage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data, error } = await getStudentTimetable(profile.id);

  if (error) {
    return <div className="p-8 text-destructive">Failed to load timetable: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
        <p className="text-muted-foreground">Your weekly class schedule for this semester.</p>
      </div>

      <div className="mt-8">
        <TimetableViewer events={data as TimetableEvent[]} title="Weekly Schedule" />
      </div>
    </div>
  );
}
