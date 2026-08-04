import { EmptyState } from "@/components/feedback/empty-state";
import { Building2 } from "lucide-react";

export default function DepartmentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Departments</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Explore academic departments, labs, and programs.
      </p>
      <EmptyState
        icon={Building2}
        title="Department directory coming soon"
        description="Department listings will connect to the academic schema in a later phase."
      />
    </div>
  );
}
