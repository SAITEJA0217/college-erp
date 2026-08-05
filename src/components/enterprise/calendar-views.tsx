"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  starts_at: string;
  ends_at?: string;
  description?: string;
}

export function CalendarViews({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "list">("month");

  const handlePrevious = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(parseISO(e.starts_at), date));
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="border rounded-md">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div key={day.toISOString()} className={`min-h-[120px] p-2 border-b border-r last:border-r-0 ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-card"}`}>
                <div className={`text-sm mb-1 ${isSameDay(day, new Date()) ? "w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="text-xs p-1 rounded bg-secondary truncate" title={event.title}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground font-medium pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="border rounded-md divide-y">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toISOString()} className={`flex p-4 gap-6 ${isToday ? "bg-muted/10" : "bg-card"}`}>
              <div className="w-16 text-center shrink-0">
                <div className="text-sm font-medium text-muted-foreground">{format(day, "EEE")}</div>
                <div className={`text-2xl mt-1 ${isToday ? "text-primary font-bold" : ""}`}>{format(day, "dd")}</div>
              </div>
              <div className="flex-1 space-y-3 border-l pl-6 min-h-[60px]">
                {dayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-1">No events</p>
                ) : (
                  dayEvents.map(event => (
                    <div key={event.id} className="bg-secondary/50 p-3 rounded-md border border-border/50">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <Badge variant="outline" className="text-[10px] capitalize">{event.event_type.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-2 gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(event.starts_at), "h:mm a")}
                          {event.ends_at && ` - ${format(parseISO(event.ends_at), "h:mm a")}`}
                        </div>
                      </div>
                      {event.description && <p className="text-sm mt-2">{event.description}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    const upcomingEvents = events.filter(e => new Date(e.starts_at) >= new Date()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    return (
      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No upcoming events</h3>
          </div>
        ) : (
          upcomingEvents.map(event => (
            <div key={event.id} className="flex gap-4 p-4 border rounded-lg bg-card">
              <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-md w-16 h-16 shrink-0">
                <span className="text-xs font-medium text-muted-foreground uppercase">{format(parseISO(event.starts_at), "MMM")}</span>
                <span className="text-lg font-bold">{format(parseISO(event.starts_at), "dd")}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-base">{event.title}</h4>
                  <Badge variant="secondary" className="capitalize text-xs">{event.event_type.replace("_", " ")}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4" />
                  {format(parseISO(event.starts_at), "EEEE, h:mm a")}
                  {event.ends_at && ` - ${format(parseISO(event.ends_at), "h:mm a")}`}
                </div>
                {event.description && <p className="text-sm mt-2">{event.description}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-2 rounded-lg border shadow-sm">
        <div className="flex space-x-1">
          <Button variant={view === "month" ? "default" : "ghost"} size="sm" onClick={() => setView("month")}>Month</Button>
          <Button variant={view === "week" ? "default" : "ghost"} size="sm" onClick={() => setView("week")}>Week</Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")}>List</Button>
        </div>

        {view !== "list" && (
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-base min-w-[150px] text-center">
              {view === "month" && format(currentDate, "MMMM yyyy")}
              {view === "week" && `Week of ${format(startOfWeek(currentDate), "MMM d")}`}
            </h2>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {view === "list" && (
          <h2 className="font-semibold text-base px-4">Upcoming Schedule</h2>
        )}
      </div>

      <div className="bg-background">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "list" && renderListView()}
      </div>
    </div>
  );
}
