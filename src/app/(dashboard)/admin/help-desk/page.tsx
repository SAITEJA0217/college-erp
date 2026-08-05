import { getTickets } from "@/features/enterprise/actions";
import { HelpDeskClient } from "./client";
import { assertRole } from "@/features/auth/user";
import { Settings } from "lucide-react";

export default async function HelpDeskPage() {
  await assertRole(["admin", "hod", "placement"]);
  const { data } = await getTickets();
  
  return (
    <div className="space-y-6 p-4 md:p-8 flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Help Desk
        </h1>
        <p className="text-muted-foreground">Manage support requests and conversations.</p>
      </div>
      
      <div className="flex-1 min-h-[600px]">
        <HelpDeskClient initialTickets={data || []} isAdmin={true} />
      </div>
    </div>
  );
}
