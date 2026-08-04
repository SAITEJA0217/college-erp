"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Users } from "lucide-react";

export type TimetableEvent = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  faculty_name: string;
  room_number: string | null;
  section_name?: string | null;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function TimetableViewer({ events, title = "Weekly Schedule" }: { events: TimetableEvent[], title?: string }) {
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    return a.start_time.localeCompare(b.start_time);
  });

  // Group by day (1 = Monday, 7 = Sunday)
  const grouped: Record<number, TimetableEvent[]> = {};
  for (let i = 1; i <= 7; i++) {
    grouped[i] = [];
  }
  
  sortedEvents.forEach(e => {
    if (grouped[e.day_of_week]) {
      grouped[e.day_of_week].push(e);
    }
  });

  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${minutes} ${ampm}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No classes scheduled.
          </div>
        ) : (
          <div className="grid gap-6">
            {DAYS.map((dayName, index) => {
              const dayIndex = index + 1;
              const dayEvents = grouped[dayIndex];
              if (!dayEvents || dayEvents.length === 0) return null;

              return (
                <div key={dayIndex} className="space-y-3">
                  <div className="font-semibold text-lg border-b pb-2 flex items-center justify-between">
                    <span>{dayName}</span>
                    <Badge variant="outline">{dayEvents.length} Classes</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {dayEvents.map(event => (
                      <div key={event.id} className="rounded-lg border p-3 flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-primary truncate" title={event.subject_name}>
                            {event.subject_code}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </Badge>
                        </div>
                        <div className="font-semibold text-sm line-clamp-1">{event.subject_name}</div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1 truncate" title={event.faculty_name}>
                            <User className="h-3 w-3 shrink-0" /> <span className="truncate">{event.faculty_name}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate" title={event.room_number || "TBD"}>
                            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{event.room_number || "TBD"}</span>
                          </div>
                          {event.section_name && (
                            <div className="flex items-center gap-1 truncate col-span-2 mt-1">
                              <Users className="h-3 w-3 shrink-0" /> <span className="truncate">Section {event.section_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
