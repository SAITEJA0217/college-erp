import { SectionHeader } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Construction } from "lucide-react";

export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <SectionHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title="Module reserved"
        description="This route is part of the foundation navigation. Feature implementation starts after Step 1 sign-off."
      />
    </div>
  );
}
