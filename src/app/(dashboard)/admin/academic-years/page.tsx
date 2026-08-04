import { getAcademicYears } from "@/features/admin/academic-actions";
import { AcademicYearsClient } from "./client";

export default async function AcademicYearsPage() {
  const data = await getAcademicYears();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AcademicYearsClient data={data} />
    </div>
  );
}
