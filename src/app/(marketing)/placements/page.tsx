import { EmptyState } from "@/components/feedback/empty-state";
import { Briefcase } from "lucide-react";

export default function PlacementsMarketingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Placements</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Recruiters, outcomes, and career services overview.
      </p>
      <EmptyState
        icon={Briefcase}
        title="Placement showcase coming soon"
        description="Public placement stats will sync from the placement module later."
      />
    </div>
  );
}
