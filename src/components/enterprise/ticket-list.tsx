"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, AlertCircle, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TicketList({ tickets, onSelectTicket, selectedId }: { tickets: any[]; onSelectTicket: (ticket: any) => void; selectedId?: string }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.ticket_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No tickets found.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredTickets.map(ticket => (
              <button 
                key={ticket.id} 
                onClick={() => onSelectTicket(ticket)}
                className={`p-4 text-left border-b hover:bg-muted/50 transition-colors ${selectedId === ticket.id ? 'bg-muted border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{ticket.ticket_number || "TKT"}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(ticket.created_at), "MMM d")}</span>
                </div>
                <h4 className="font-medium text-sm line-clamp-1 mb-2">{ticket.subject}</h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'in_progress' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                      {ticket.status.replace("_", " ")}
                    </Badge>
                    {ticket.priority === 'urgent' && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.replies?.length || 0}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
