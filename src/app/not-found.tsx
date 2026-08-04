import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you are looking for does not exist or was moved."
        action={
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        }
        className="max-w-lg w-full"
      />
    </div>
  );
}
