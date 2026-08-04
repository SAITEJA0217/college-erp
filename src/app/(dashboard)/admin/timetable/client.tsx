"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimetableViewer, TimetableEvent } from "@/components/timetable/timetable-viewer";
import { getTimetableForSection, createTimetableSlot, deleteTimetableSlot } from "@/features/timetable/actions";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Section = { id: string; name: string; label: string; semester_id: string };
type Faculty = { id: string; name: string };
type Subject = { id: string; name: string; code: string; semester_id: string };

export function AdminTimetableClient({
  sections,
  faculty,
  subjects,
}: {
  sections: Section[];
  faculty: Faculty[];
  subjects: Subject[];
}) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Form State
  const [form, setForm] = useState({
    subject_id: "",
    faculty_id: "",
    day_of_week: "1",
    start_time: "09:00",
    end_time: "10:00",
    room_number: "",
  });

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;
    
    if (form.start_time >= form.end_time) {
      toast.error("Start time must be before end time");
      return;
    }

    setAdding(true);
    const result = await createTimetableSlot({
      section_id: selectedSection,
      subject_id: form.subject_id,
      faculty_id: form.faculty_id,
      day_of_week: parseInt(form.day_of_week, 10),
      start_time: form.start_time,
      end_time: form.end_time,
      room_number: form.room_number,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Class added to timetable");
      setIsAddOpen(false);
      loadTimetable(selectedSection);
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    const result = await deleteTimetableSlot(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Class deleted");
      loadTimetable(selectedSection);
    }
  };

  const activeSection = sections.find(s => s.id === selectedSection);
  const filteredSubjects = subjects.filter(s => s.semester_id === activeSection?.semester_id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Section</CardTitle>
          <CardDescription>Choose a section to manage its timetable.</CardDescription>
        </CardHeader>
        <CardContent>
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)} 
            className="flex h-10 w-full md:w-1/2 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Choose a section...</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSection && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Class</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Class to Timetable</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <select required value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select subject...</option>
                      {filteredSubjects.map(s => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Faculty</Label>
                    <select required value={form.faculty_id} onChange={e => setForm({...form, faculty_id: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select faculty...</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <select required value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="7">Sunday</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Room Number</Label>
                      <Input placeholder="e.g. 101, Lab A" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" required value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" required value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={adding}>
                    {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative">
               {/* Custom viewer variant that supports deletion for admin */}
               <TimetableViewer events={events} title={`Timetable for ${activeSection?.label.split('>').pop()?.trim()}`} />
               
               {/* Quick deletion overlay list */}
               {events.length > 0 && (
                 <Card className="mt-8 border-destructive/20">
                   <CardHeader>
                     <CardTitle className="text-sm">Manage Classes</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-2">
                       {events.map(ev => (
                         <div key={ev.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
                           <div className="text-sm">
                             <span className="font-semibold">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][ev.day_of_week-1]}</span> • {ev.start_time} - {ev.end_time} • {ev.subject_code} ({ev.faculty_name})
                           </div>
                           <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ev.id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
