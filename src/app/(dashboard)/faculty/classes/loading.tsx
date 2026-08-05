import { TableSkeleton } from "@/components/feedback/skeletons";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
      </div>
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}
