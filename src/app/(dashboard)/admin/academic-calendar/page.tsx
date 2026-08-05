import { getCalendarEvents } from "@/features/enterprise/actions";
import { CalendarViews } from "@/components/enterprise/calendar-views";
import { CalendarEventForm } from "@/components/enterprise/calendar-event-form";
import { assertRole } from "@/features/auth/user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default async function AcademicCalendarPage() {
  await assertRole(["admin"]);
  const { data } = await getCalendarEvents();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Calendar</h1>
          <p className="text-muted-foreground">University events, holidays, exams and academic deadlines.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Calendar Event</DialogTitle>
              <DialogDescription>
                Add a new event, holiday, or deadline to the academic calendar.
              </DialogDescription>
            </DialogHeader>
            <CalendarEventForm />
          </DialogContent>
        </Dialog>
      </div>

      <CalendarViews events={data || []} />
    </div>
  );
}
