"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { gradeSubmission, getSubmissionSignedUrl } from "@/features/assignments/actions";
import { ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export function AssignmentGradingClient({ 
  assignment, 
  gradingData 
}: { 
  assignment: any; 
  gradingData: any[];
}) {
  const [data, setData] = useState(gradingData);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Grade Form
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleOpenGrade = (sub: any) => {
    setSelectedSub(sub);
    setMarks(sub.marks_obtained?.toString() || "");
    setFeedback(sub.feedback || "");
    setIsGradeOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSub?.submission_id) return;
    
    const numMarks = parseInt(marks, 10);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > assignment.max_marks) {
      toast.error(`Marks must be between 0 and ${assignment.max_marks}`);
      return;
    }

    setSaving(true);
    const result = await gradeSubmission(selectedSub.submission_id, numMarks, feedback);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Grade saved!");
      setData(data.map(d => 
        d.submission_id === selectedSub.submission_id 
          ? { ...d, marks_obtained: numMarks, feedback } 
          : d
      ));
      setIsGradeOpen(false);
    }
    setSaving(false);
  };

  const handleViewFile = async (filePath: string) => {
    const toastId = toast.loading("Generating secure link...");
    const result = await getSubmissionSignedUrl(filePath);
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.dismiss(toastId);
      window.open(result.url, "_blank");
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((student) => {
            const isSubmitted = !!student.submission_id;
            const isGraded = student.marks_obtained !== null;
            let statusBadge = <Badge variant="secondary">Not Submitted</Badge>;
            
            if (isSubmitted) {
              const subTime = new Date(student.submitted_at);
              const deadline = new Date(assignment.deadline);
              if (subTime > deadline) {
                statusBadge = <Badge variant="destructive" className="flex w-fit items-center"><AlertCircle className="h-3 w-3 mr-1" /> Late</Badge>;
              } else {
                statusBadge = <Badge variant="default" className="flex w-fit items-center bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-3 w-3 mr-1" /> On Time</Badge>;
              }
            }

            return (
              <TableRow key={student.student_id}>
                <TableCell>
                  <div className="font-medium">{student.student_name}</div>
                  <div className="text-xs text-muted-foreground">{student.enrollment_number}</div>
                </TableCell>
                <TableCell>{statusBadge}</TableCell>
                <TableCell>
                  {student.submitted_at 
                    ? format(parseISO(student.submitted_at), "MMM d, h:mm a") 
                    : "-"}
                </TableCell>
                <TableCell>
                  {isGraded ? (
                    <span className="font-bold">{student.marks_obtained} <span className="text-muted-foreground text-xs font-normal">/ {assignment.max_marks}</span></span>
                  ) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {student.file_url && (
                      <Button variant="outline" size="sm" onClick={() => handleViewFile(student.file_url)}>
                        <ExternalLink className="h-4 w-4 mr-2" /> View File
                      </Button>
                    )}
                    {isSubmitted && (
                      <Button size="sm" variant={isGraded ? "secondary" : "default"} onClick={() => handleOpenGrade(student)}>
                        {isGraded ? "Edit Grade" : "Grade"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No students found in assigned sections.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{selectedSub?.student_name}</span>
              <span className="text-xs text-muted-foreground">{selectedSub?.enrollment_number}</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Marks Obtained (Max: {assignment.max_marks})</label>
              <Input 
                type="number" 
                min="0" 
                max={assignment.max_marks} 
                value={marks} 
                onChange={(e) => setMarks(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback (Optional)</label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Great job on..."
              />
            </div>
            <Button onClick={handleSaveGrade} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Grade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
