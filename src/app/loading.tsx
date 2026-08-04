import { PageSkeleton } from "@/components/feedback/skeletons";

export default function Loading() {
  return (
    <div className="min-h-svh p-6">
      <PageSkeleton />
    </div>
  );
}
