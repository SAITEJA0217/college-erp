import { getAcademicYears, getSections } from "@/features/admin/academic-actions";
import { ClassesClient } from "./client";

export default async function ClassesPage() {
  const [academicYears, sections] = await Promise.all([
    getAcademicYears(),
    getSections(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ClassesClient academicYears={academicYears} sections={sections} />
    </div>
  );
}
