import { getCalendarEvents } from "@/features/enterprise/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

export async function CalendarWidget() {
  const { data: events, error } = await getCalendarEvents();

  if (error || !events) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Failed to load calendar events.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const upcomingEvents = events
    .filter((e: any) => new Date(e.starts_at) >= new Date())
    .sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 5);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <CardTitle>Academic Calendar</CardTitle>
        </div>
        <CardDescription>Upcoming schedule and deadlines</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground pt-4 text-center">No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event: any) => {
              const startDate = parseISO(event.starts_at);
              const isToday = isSameDay(startDate, new Date());
              
              return (
                <div key={event.id} className="flex gap-3">
                  <div className={`flex flex-col items-center justify-center rounded-md w-12 h-12 shrink-0 ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <span className="text-[10px] font-medium uppercase opacity-80">{format(startDate, "MMM")}</span>
                    <span className="text-lg font-bold leading-none mt-0.5">{format(startDate, "dd")}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-semibold leading-tight line-clamp-1" title={event.title}>{event.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {format(startDate, "h:mm a")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
