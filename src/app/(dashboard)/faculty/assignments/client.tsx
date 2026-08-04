"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createAssignment } from "@/features/assignments/actions";
import { toast } from "sonner";
import { Loader2, Plus, FileText, CalendarClock, Users, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function FacultyAssignmentsClient({ 
  facultyId, 
  subjects, 
  initialAssignments 
}: { 
  facultyId: string; 
  subjects: any[]; 
  initialAssignments: any[];
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !title || !deadline || !maxMarks) {
      toast.error("Please fill all required fields");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("faculty_id", facultyId);
    formData.append("subject_id", subjectId);
    formData.append("title", title);
    formData.append("description", description);
    
    // Ensure deadline is valid ISO with timezone for Postgres
    const localDate = new Date(deadline);
    formData.append("deadline", localDate.toISOString());
    
    formData.append("max_marks", maxMarks);
    if (file) formData.append("file", file);

    const result = await createAssignment(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Assignment created successfully!");
      setIsAddOpen(false);
      window.location.reload(); 
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Card className="px-4 py-2 flex flex-col justify-center bg-primary/5 border-primary/20">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Created</span>
            <span className="text-2xl font-bold">{initialAssignments.length}</span>
          </Card>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Create Assignment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Case Study" />
              </div>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Details and guidelines..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deadline *</Label>
                  <Input required type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Marks *</Label>
                  <Input required type="number" min="1" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reference Material (Optional)</Label>
                <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground">Attach a PDF, DOCX, or ZIP containing instructions or datasets (Max 50MB).</p>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploading ? "Publishing..." : "Publish Assignment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {initialAssignments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No assignments created</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">Create your first assignment to start evaluating students.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialAssignments.map(a => {
            const isOverdue = new Date() > new Date(a.deadline);
            
            return (
              <Card key={a.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={isOverdue ? "secondary" : "default"}>
                      {isOverdue ? "Closed" : "Active"}
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {a.max_marks} Marks
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg leading-tight mb-1">{a.title}</h3>
                  <div className="text-xs font-medium text-primary mb-4">{a.subject_code} - {a.subject_name}</div>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                      Due: {format(parseISO(a.deadline), "MMM d, yyyy h:mm a")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      {a.submissions_count} Submissions received
                    </div>
                    
                    <div className="pt-3 border-t border-border/50">
                      <Button asChild variant="outline" className="w-full justify-between group">
                        <Link href={`/faculty/assignments/${a.id}`}>
                          Review Submissions
                          <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
