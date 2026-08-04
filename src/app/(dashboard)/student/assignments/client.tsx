"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CalendarClock, UploadCloud, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { submitAssignment } from "@/features/assignments/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function StudentAssignmentsClient({ 
  studentId, 
  assignments 
}: { 
  studentId: string; 
  assignments: any[];
}) {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleOpenSubmit = (assignment: any) => {
    setSelectedAssignment(assignment);
    setFile(null);
    setIsSubmitOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to submit");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("assignment_id", selectedAssignment.id);
    formData.append("student_id", studentId);
    formData.append("file", file);

    const result = await submitAssignment(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Assignment submitted successfully!");
      setIsSubmitOpen(false);
      window.location.reload();
    }
    setUploading(false);
  };

  const pending = assignments.filter(a => !a.submission && new Date() <= new Date(a.deadline));
  const submitted = assignments.filter(a => !!a.submission);
  const missed = assignments.filter(a => !a.submission && new Date() > new Date(a.deadline));

  const AssignmentCard = ({ a, status }: { a: any, status: "pending" | "submitted" | "missed" }) => {
    const isGraded = a.submission?.marks_obtained !== null && a.submission?.marks_obtained !== undefined;
    
    return (
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3">
            {status === "pending" && <Badge variant="secondary" className="flex items-center"><CalendarClock className="w-3 h-3 mr-1"/> Pending</Badge>}
            {status === "submitted" && <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Submitted</Badge>}
            {status === "missed" && <Badge variant="destructive" className="flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Missed</Badge>}
            
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {a.max_marks} Marks
            </span>
          </div>
          
          <h3 className="font-bold text-lg leading-tight mb-1">{a.title}</h3>
          <div className="text-xs font-medium text-primary mb-3">{a.subject_code} - {a.subject_name}</div>
          
          {a.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {a.description}
            </p>
          )}

          <div className="mt-auto space-y-3">
            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
              <div className="flex flex-col">
                <span className="font-semibold">Deadline</span>
                <span>{format(parseISO(a.deadline), "MMM d, h:mm a")}</span>
              </div>
              {a.file_url && (
                <a href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center text-primary hover:underline">
                  <ExternalLink className="h-3 w-3 mr-1" /> Attached File
                </a>
              )}
            </div>

            {status === "submitted" && (
              <div className="bg-primary/5 p-3 rounded-md border border-primary/20 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Marks Obtained:</span>
                  {isGraded ? (
                    <span className="font-bold text-lg">{a.submission.marks_obtained} <span className="text-sm text-muted-foreground font-normal">/ {a.max_marks}</span></span>
                  ) : (
                    <span className="text-muted-foreground italic">Pending Review</span>
                  )}
                </div>
                {isGraded && a.submission.feedback && (
                  <div className="text-xs text-muted-foreground border-t border-primary/10 pt-2 mt-2">
                    <span className="font-semibold block mb-1 text-primary">Faculty Feedback:</span>
                    {a.submission.feedback}
                  </div>
                )}
              </div>
            )}

            {status === "pending" && (
              <Button onClick={() => handleOpenSubmit(a)} className="w-full">
                <UploadCloud className="h-4 w-4 mr-2" /> Upload Submission
              </Button>
            )}

            {status === "submitted" && new Date() <= new Date(a.deadline) && (
              <Button onClick={() => handleOpenSubmit(a)} variant="outline" className="w-full">
                <UploadCloud className="h-4 w-4 mr-2" /> Override Submission
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({missed.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="pt-6">
          {pending.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">No pending assignments!</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map(a => <AssignmentCard key={a.id} a={a} status="pending" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="pt-6">
          {submitted.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">You haven't submitted any assignments yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submitted.map(a => <AssignmentCard key={a.id} a={a} status="submitted" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="missed" className="pt-6">
          {missed.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">You haven't missed any assignments. Keep it up!</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {missed.map(a => <AssignmentCard key={a.id} a={a} status="missed" />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-sm font-semibold">{selectedAssignment?.title}</span>
              <span className="text-xs text-muted-foreground">Due: {selectedAssignment?.deadline && format(parseISO(selectedAssignment.deadline), "MMM d, h:mm a")}</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File (PDF, DOCX, ZIP)</label>
              <Input 
                type="file" 
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
              <p className="text-xs text-muted-foreground">Maximum file size: 50MB. Late submissions will be rejected.</p>
            </div>
            
            <Button type="submit" className="w-full mt-4" disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading ? "Uploading..." : "Submit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
