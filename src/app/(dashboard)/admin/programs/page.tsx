import { getPrograms } from "@/features/admin/academic-actions";
import { ProgramsClient } from "./client";

export default async function ProgramsPage() {
  const data = await getPrograms();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ProgramsClient data={data} />
    </div>
  );
}
