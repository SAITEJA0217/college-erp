import { EmptyState } from "@/components/feedback/empty-state";
import { Info } from "lucide-react";

function MarketingStub({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      </div>
      <EmptyState
        icon={Info}
        title={`${title} content arrives next`}
        description="Public marketing sections are scaffolded. Rich content and CMS-backed pages will be added in a later phase."
      />
    </div>
  );
}

export default function AboutPage() {
  return (
    <MarketingStub
      title="About"
      description="Learn about our mission, leadership, and academic excellence."
    />
  );
}
