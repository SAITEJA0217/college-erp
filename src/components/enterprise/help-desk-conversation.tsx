"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Send, Paperclip, Loader2, UserRound, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { replyToTicket, updateTicketStatus } from "@/features/enterprise/actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function HelpDeskConversation({ ticket, onUpdate, isAdmin = false }: { ticket: any; onUpdate?: () => void; isAdmin?: boolean }) {
  const [replyBody, setReplyBody] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setIsReplying(true);

    try {
      const res = await replyToTicket({ ticket_id: ticket.id, body: replyBody.trim() });
      if (res.success) {
        toast.success("Reply sent");
        setReplyBody("");
        if (onUpdate) onUpdate();
      } else {
        toast.error(`Failed to reply: ${res.error}`);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (status: any) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateTicketStatus(ticket.id, status);
      if (res.success) {
        toast.success(`Ticket status updated to ${status}`);
        if (onUpdate) onUpdate();
      } else {
        toast.error(`Failed to update status: ${res.error}`);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
        <p>Select a ticket to view conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-start bg-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{ticket.subject}</h2>
            <Badge variant="outline">{ticket.ticket_number || "TKT"}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserRound className="h-4 w-4" />
              {ticket.requester?.full_name}
            </span>
            <span>•</span>
            <span>{format(new Date(ticket.created_at), "PPp")}</span>
            <span>•</span>
            <span className="capitalize">{ticket.category}</span>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={ticket.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'in_progress' ? 'default' : 'secondary'} className="capitalize">
            {ticket.status.replace("_", " ")}
          </Badge>
        )}
      </div>

      {/* Conversation Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-3xl mx-auto pb-4">
          {/* Initial Ticket */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserRound className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="bg-muted/50 p-4 rounded-lg rounded-tl-none border">
                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                {ticket.attachment_url && (
                  <div className="mt-3 pt-3 border-t">
                    <a href={ticket.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <Paperclip className="h-3 w-3" /> View Attachment
                    </a>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-1">{format(new Date(ticket.created_at), "p")}</p>
            </div>
          </div>

          {/* Replies */}
          {ticket.replies?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((reply: any) => {
            const isAuthor = reply.author_id === ticket.requester_id;
            
            return (
              <div key={reply.id} className={`flex gap-4 ${!isAuthor ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAuthor ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"}`}>
                  {isAuthor ? <UserRound className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                </div>
                <div className={`flex-1 flex flex-col ${!isAuthor ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-lg border max-w-[85%] ${isAuthor ? "bg-muted/50 rounded-tl-none" : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 rounded-tr-none"}`}>
                    <p className="text-sm whitespace-pre-wrap">{reply.body}</p>
                    {reply.attachment_url && (
                      <div className={`mt-3 pt-3 border-t ${isAuthor ? "" : "border-blue-200 dark:border-blue-800"}`}>
                        <a href={reply.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Paperclip className="h-3 w-3" /> View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mx-1">
                    {!isAuthor && <span className="font-medium text-blue-600 dark:text-blue-400 mr-2">Support Team</span>}
                    {format(new Date(reply.created_at), "p")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      {ticket.status !== "closed" ? (
        <div className="p-4 border-t bg-card">
          <div className="max-w-3xl mx-auto relative">
            <Textarea 
              placeholder="Type your reply here..." 
              className="min-h-[100px] resize-none pr-24 pb-12"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground" type="button">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleReply} disabled={isReplying || !replyBody.trim()}>
                {isReplying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t bg-muted text-center text-sm text-muted-foreground">
          This ticket has been closed. Replies are disabled.
        </div>
      )}
    </div>
  );
}

// Ensure this icon is available for the empty state
function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
