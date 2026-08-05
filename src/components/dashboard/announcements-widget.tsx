import { Megaphone } from "lucide-react";
import { getAnnouncements } from "@/features/enterprise/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export async function AnnouncementsWidget() {
  const { data: announcements, error } = await getAnnouncements();

  if (error || !announcements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Failed to load announcements.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <CardTitle>Announcements</CardTitle>
        </div>
        <CardDescription>Latest updates and notices</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[300px] px-6 pb-6">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground pt-4 text-center">No active announcements.</p>
          ) : (
            <div className="space-y-4 pt-2">
              {announcements.map((announcement: any) => (
                <div key={announcement.id} className="flex flex-col space-y-1 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm leading-tight">{announcement.title}</h4>
                    {announcement.priority === "urgent" && <Badge variant="destructive" className="text-[10px] px-1 h-4">URGENT</Badge>}
                    {announcement.priority === "high" && <Badge variant="default" className="text-[10px] px-1 h-4">HIGH</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {announcement.author?.full_name || "Admin"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(announcement.publish_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
