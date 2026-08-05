"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimetableViewer, TimetableEvent } from "@/components/timetable/timetable-viewer";
import { getTimetableForSection } from "@/features/timetable/actions";
import { deleteFacultyAssignment } from "@/features/admin/allocation-actions";
import { toast } from "sonner";
import { Loader2, Trash2, Edit, GraduationCap, MapPin, User, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Section = { id: string; name: string; label: string; semester_id: string; program_name?: string; department_name?: string; semester_number?: number };

export function AdminTimetableClient({
  sections,
}: {
  sections: Section[];
}) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTimetable = async (sectionId: string) => {
    if (!sectionId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    const { data, error } = await getTimetableForSection(sectionId);
    if (error) {
      toast.error(error);
    } else {
      setEvents(data as TimetableEvent[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTimetable(selectedSection);
  }, [selectedSection]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this class from the timetable? This will delete the faculty class assignment entirely.")) return;
    const result = await deleteFacultyAssignment(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Class removed successfully");
      loadTimetable(selectedSection);
    }
  };

  const activeSection = sections.find(s => s.id === selectedSection);
  
  const academicTitle = activeSection 
    ? `${activeSection.program_name || "Program"} | Semester ${activeSection.semester_number} • Section ${activeSection.name}`
    : "";

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Select Section</CardTitle>
          <CardDescription>Choose a section to view and manage its timetable.</CardDescription>
        </CardHeader>
        <CardContent>
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)} 
            className="flex h-10 w-full md:w-1/2 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">Choose a section...</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSection && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex flex-col items-center justify-center text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
            <GraduationCap className="h-10 w-10 text-primary mb-3" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{academicTitle}</h2>
            <div className="flex gap-2 mt-3 flex-wrap justify-center">
               <Badge variant="outline" className="bg-background/50">Academic Year 2026-27</Badge>
               <Badge variant="outline" className="bg-background/50">{activeSection?.department_name}</Badge>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
               <TimetableViewer events={events} title={"Weekly Schedule"} />
               
               <Card className="shadow-sm border-0 bg-background overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                   <div>
                     <CardTitle className="text-lg">Manage Classes</CardTitle>
                     <CardDescription>View, edit, or remove scheduled classes for this section.</CardDescription>
                   </div>
                   <Button asChild variant="outline" size="sm">
                     <Link href="/admin/faculty-class-allocations">Add New Class</Link>
                   </Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3 font-medium">Subject</th>
                            <th className="px-4 py-3 font-medium">Faculty</th>
                            <th className="px-4 py-3 font-medium">Time</th>
                            <th className="px-4 py-3 font-medium">Room</th>
                            <th className="px-4 py-3 font-medium">Department</th>
                            <th className="px-4 py-3 font-medium">Semester</th>
                            <th className="px-4 py-3 font-medium">Section</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {events.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No classes found.</td>
                            </tr>
                          ) : (
                            events.map(ev => (
                              <tr key={ev.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-foreground">{ev.subject_code}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1" title={ev.subject_name}>{ev.subject_name}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground"/> {ev.faculty_name}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground"/> 
                                    <span className="font-medium">{ev.day_of_week}</span> <span className="text-muted-foreground text-xs">{ev.start_time.slice(0,5)} - {ev.end_time.slice(0,5)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground"/> {ev.room_number || "TBD"}
                                  </div>
                                </td>
                                <td className="px-4 py-3">{activeSection?.department_name}</td>
                                <td className="px-4 py-3">Sem {activeSection?.semester_number}</td>
                                <td className="px-4 py-3">{ev.section_name || activeSection?.name}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                                      <Link href={`/admin/faculty-class-allocations`} title="Edit Allocation"><Edit className="h-4 w-4"/></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ev.id)} title="Delete Class">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                 </CardContent>
               </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
