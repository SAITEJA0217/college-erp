import { getFaculty } from "@/features/admin/user-actions";
import { getDepartments } from "@/features/admin/academic-actions";
import { FacultyClient } from "./client";

export default async function FacultyPage() {
  const faculty = await getFaculty();
  const departments = await getDepartments();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <FacultyClient data={faculty} departments={departments} />
    </div>
  );
}
