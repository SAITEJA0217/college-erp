import { EmptyState } from "@/components/feedback/empty-state";
import { Images } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Gallery</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Campus life, events, and infrastructure highlights.
      </p>
      <EmptyState
        icon={Images}
        title="Gallery media coming soon"
        description="Image collections will use Supabase Storage in a later phase."
      />
    </div>
  );
}
