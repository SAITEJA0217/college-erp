import { getStudents } from "@/features/admin/user-actions";
import { getDepartments, getSemesters, getSections } from "@/features/admin/academic-actions";
import { StudentsClient } from "./client";

export default async function StudentsPage() {
  const students = await getStudents();
  const departments = await getDepartments();
  const semesters = await getSemesters();
  const sections = await getSections();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <StudentsClient 
        data={students} 
        departments={departments}
        semesters={semesters}
        sections={sections}
      />
    </div>
  );
}
