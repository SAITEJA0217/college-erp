import { getSubjects } from "@/features/admin/academic-actions";
import { SubjectsClient } from "./client";

export default async function SubjectsPage() {
  const data = await getSubjects();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SubjectsClient data={data} />
    </div>
  );
}
