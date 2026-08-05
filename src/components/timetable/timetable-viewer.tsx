"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, Users } from "lucide-react";

export type TimetableEvent = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  faculty_name: string;
  room_number: string | null;
  section_name?: string | null;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetableViewer({ events, title = "Weekly Schedule" }: { events: TimetableEvent[], title?: string }) {
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Determine the time slots (unique start and end boundaries)
  const uniqueTimes = new Set<string>();
  sortedEvents.forEach(e => {
    uniqueTimes.add(e.start_time.slice(0, 5));
    uniqueTimes.add(e.end_time.slice(0, 5));
  });

  const timeSlots = Array.from(uniqueTimes).sort();

  // If no classes, set a default range like 09:00 - 16:00
  if (timeSlots.length === 0) {
    timeSlots.push("09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00");
  } else {
    // Fill in intermediate hourly slots for continuous grid if we want, but letting grid auto-handle is fine.
    // Actually, for a CSS Grid, if we map time ranges to row indices, we need a continuous timeline.
    // To make it simple and professional, we will render rows based on the exact time blocks used in the timetable.
  }

  // Create blocks based on start_time and end_time pairs to represent standard slots
  const slotBlocks: { start: string, end: string }[] = [];
  sortedEvents.forEach(e => {
    const s = e.start_time.slice(0, 5);
    const end = e.end_time.slice(0, 5);
    if (!slotBlocks.find(b => b.start === s && b.end === end)) {
      slotBlocks.push({ start: s, end: end });
    }
  });
  
  // Sort blocks chronologically
  slotBlocks.sort((a, b) => a.start.localeCompare(b.start));

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
    <Card className="w-full shadow-sm border-0 bg-background">
      <CardHeader className="bg-muted/30 rounded-t-xl border-b pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {events.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
               <MapPin className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p>No classes scheduled yet.</p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-7 border-b bg-muted/20">
              <div className="p-3 border-r font-semibold text-center text-sm text-muted-foreground bg-muted/40">
                Time
              </div>
              {DAYS.map((dayName) => (
                <div key={dayName} className="p-3 border-r font-bold text-center text-sm last:border-0">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            {slotBlocks.map((slot, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7 border-b group hover:bg-muted/10 transition-colors last:border-0">
                {/* Time Label */}
                <div className="p-3 border-r flex flex-col justify-center items-center text-center bg-muted/5 font-medium text-xs text-muted-foreground border-b-0">
                  <span>{formatTime(slot.start)}</span>
                  <span className="text-[10px] opacity-70">to</span>
                  <span>{formatTime(slot.end)}</span>
                </div>

                {/* Day Cells */}
                {DAYS.map((dayName) => {
                  const cellEvents = sortedEvents.filter(
                    e => e.day_of_week === dayName && e.start_time.slice(0, 5) === slot.start
                  );

                  return (
                    <div key={dayName} className="p-2 border-r last:border-0 min-h-[100px] relative">
                      {cellEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="absolute inset-1 m-1 p-2 rounded-md border bg-card shadow-sm border-l-4 border-l-primary flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow z-10"
                        >
                          <div>
                            <div className="font-bold text-xs truncate" title={event.subject_name}>
                              {event.subject_code}
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-0.5">
                              {event.subject_name}
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground truncate" title={event.faculty_name}>
                              <User className="h-3 w-3 shrink-0" /> 
                              <span className="truncate">{event.faculty_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground truncate" title={event.room_number || "TBD"}>
                              <MapPin className="h-3 w-3 shrink-0" /> 
                              <span className="truncate">{event.room_number || "TBD"}</span>
                            </div>
                            {event.section_name && (
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground truncate">
                                <Users className="h-3 w-3 shrink-0" /> 
                                <span className="truncate">{event.section_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
