import { getSections } from "@/features/admin/academic-actions";
import { SectionsClient } from "./client";

export default async function SectionsPage() {
  const data = await getSections();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SectionsClient data={data} />
    </div>
  );
}
