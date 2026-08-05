"use client";

import { useState } from "react";
import { TicketList } from "@/components/enterprise/ticket-list";
import { HelpDeskConversation } from "@/components/enterprise/help-desk-conversation";
import { useRouter } from "next/navigation";

export function HelpDeskClient({ initialTickets, isAdmin = false }: { initialTickets: any[], isAdmin?: boolean }) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const router = useRouter();

  // Handle updates that need a data refresh
  const handleUpdate = () => {
    router.refresh();
    // Optimistically could update state, but refresh is simpler for now
  };

  // Find the selected ticket from fresh data if it was updated
  const currentTicket = selectedTicket 
    ? initialTickets.find(t => t.id === selectedTicket.id) || selectedTicket 
    : null;

  return (
    <div className="flex h-[calc(100vh-130px)] rounded-lg border overflow-hidden bg-card">
      <div className="w-1/3 min-w-[300px] border-r bg-background">
        <TicketList 
          tickets={initialTickets} 
          onSelectTicket={setSelectedTicket} 
          selectedId={currentTicket?.id} 
        />
      </div>
      <div className="flex-1 flex flex-col bg-muted/10">
        <HelpDeskConversation 
          ticket={currentTicket} 
          onUpdate={handleUpdate} 
          isAdmin={isAdmin} 
        />
      </div>
    </div>
  );
}
