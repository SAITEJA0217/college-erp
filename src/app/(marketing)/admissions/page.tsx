import { EmptyState } from "@/components/feedback/empty-state";
import { GraduationCap } from "lucide-react";

export default function AdmissionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Admissions</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Programs, eligibility, deadlines, and application guidance.
      </p>
      <EmptyState
        icon={GraduationCap}
        title="Admissions content scaffolded"
        description="Forms and program details will be added after the ERP foundation is complete."
      />
    </div>
  );
}
