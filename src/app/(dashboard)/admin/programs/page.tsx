import { getDepartments, getPrograms, getSchools } from "@/features/admin/academic-actions";
import { ProgramsClient } from "./client";

export default async function ProgramsPage() {
  const [data, departments, schools] = await Promise.all([getPrograms(), getDepartments(), getSchools()]);
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ProgramsClient data={data} departments={departments} schools={schools} />
    </div>
  );
}
