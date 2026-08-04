import { getSemesters } from "@/features/admin/academic-actions";
import { SemestersClient } from "./client";

export default async function SemestersPage() {
  const data = await getSemesters();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SemestersClient data={data} />
    </div>
  );
}
