"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function ClientPrinterButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="h-4 w-4 mr-2" /> Print Gradecard
    </Button>
  );
}
