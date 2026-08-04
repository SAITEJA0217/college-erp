import { getDepartments } from "@/features/admin/academic-actions";
import { DepartmentsClient } from "./client";

export default async function DepartmentsPage() {
  const data = await getDepartments();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DepartmentsClient data={data} />
    </div>
  );
}
