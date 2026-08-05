import { getSchools } from "@/features/admin/academic-actions";
import { CollegesClient } from "./client";

export default async function CollegesPage() {
  const data = await getSchools();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CollegesClient data={data} />
    </div>
  );
}
