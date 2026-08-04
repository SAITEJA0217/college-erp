import { getFacultyAssignments } from "@/features/admin/academic-actions";
import { FacultyAssignmentsClient } from "./client";

export default async function FacultyAssignmentsPage() {
  const data = await getFacultyAssignments();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <FacultyAssignmentsClient data={data} />
    </div>
  );
}
