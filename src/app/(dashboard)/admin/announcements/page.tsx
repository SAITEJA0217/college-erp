import { getAnnouncements } from "@/features/entrise/actions";
import { AnnouncementForm } from "@/components/entrise/announcement-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus } from "lucide-react";
import { assertRole } from "@/features/auth/user";

export default async function AnnouncementsPage() {
  await assertRole(["admin", "hod", "placement"]);
  const { data: announcements } = await getAnnouncements();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Announcements
          </h1>
          <p className="text-muted-foreground">Manage campus-wide and targeted announcements.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>
                Publish a new announcement to specific audiences or campus-wide.
              </DialogDescription>
            </DialogHeader>
            <AnnouncementForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements?.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <Megaphone className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No announcements found</h3>
            <p className="text-sm text-muted-foreground">Create your first announcement to notify users.</p>
          </div>
        ) : (
          announcements?.map((ann: any) => (
            <div key={ann.id} className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{ann.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{ann.audience}</Badge>
                    {ann.priority === "urgent" && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                    {ann.priority === "high" && <Badge className="text-xs">High Priority</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{new Date(ann.publish_at).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">by {ann.author?.full_name}</p>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm">{ann.content}</div>
              {ann.attachment_url && (
                <div className="mt-4 pt-4 border-t">
                  <a href={ann.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
