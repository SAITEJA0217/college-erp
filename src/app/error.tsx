"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/empty-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="Unexpected error"
        description={error.message || "An unexpected error occurred."}
        onRetry={reset}
        className="max-w-lg w-full"
      />
      <Button type="button" className="sr-only" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
