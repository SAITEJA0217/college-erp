import { EmptyState } from "@/components/feedback/empty-state";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Reach admissions, academics, and campus administration.
      </p>
      <EmptyState
        icon={Mail}
        title="Contact channels scaffolded"
        description="Contact forms and office details will be wired after foundation."
      />
    </div>
  );
}
