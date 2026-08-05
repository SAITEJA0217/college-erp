import { getTimetableForFaculty } from "@/features/timetable/actions";
import { assertRole } from "@/features/auth/user";
import { CalendarClock } from "lucide-react";
import { TimetableViewer } from "@/components/timetable/timetable-viewer";

export default async function HODTimetablePage() {
  const profile = await assertRole(["hod"]);
  
  // Note: For a real application, you might want to fetch all timetables for the department.
  // For now, we will fetch the timetable where the HOD is teaching, or show a department view placeholder.
  // Assuming getTimetableForFaculty fetches the timetable for the current user (if they are also a faculty).
  const { data: timetable } = await getTimetableForFaculty(profile.id);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarClock className="h-8 w-8" />
          Department Timetable
        </h1>
        <p className="text-muted-foreground">View and manage class schedules for your department.</p>
      </div>
      
      {timetable ? (
        <TimetableViewer events={timetable} title="Department Timetable" />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
          <CalendarClock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No Timetable Data</h3>
          <p className="text-sm text-muted-foreground">The timetable for this department has not been configured yet.</p>
        </div>
      )}
    </div>
  );
}
