import { BookOpen } from "lucide-react";

export function ClassesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card/30 min-h-[400px]">
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-primary/10">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight">No Classes Assigned</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        You have not been assigned any teaching classes yet. When assignments are published for the semester, they will appear here.
      </p>
    </div>
  );
}
