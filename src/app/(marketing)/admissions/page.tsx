import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdmissionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 space-y-6">
      <div>
        <Button asChild variant="ghost" className="mb-4 text-[#1E2A78] hover:text-[#F47C20]">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to portal
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E2A78]">Admissions</h1>
        <p className="max-w-2xl text-muted-foreground mt-1">
          Programs, eligibility, deadlines, and application guidance.
        </p>
      </div>
      <EmptyState
        icon={GraduationCap}
        title="Admissions content scaffolded"
        description="Forms and program details will be added after the ERP foundation is complete."
      />
    </div>
  );
}
