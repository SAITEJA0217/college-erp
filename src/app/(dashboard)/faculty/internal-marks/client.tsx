"use client";

import { useState, useEffect } from "react";
import { 
  getStudentsForSection, 
  saveInternalMarks, 
  publishInternalMarks, 
  getExistingMarks 
} from "@/features/internal-marks/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Save, Share2 } from "lucide-react";

interface FacultyClass {
  assignmentId: string;
  sectionId: string;
  sectionLabel: string;
  subjectId: string;
  subjectName: string;
}

export function FacultyInternalMarksClient({ 
  classesList, 
  facultyId 
}: { 
  classesList: FacultyClass[]; 
  facultyId: string; 
}) {
  const [selectedClassIndex, setSelectedClassIndex] = useState<string>("");
  const [assessmentName, setAssessmentName] = useState<string>("Mid-1");
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const activeClass = selectedClassIndex !== "" ? classesList[Number(selectedClassIndex)] : null;

  // Fetch student roster when active class changes
  useEffect(() => {
    if (!activeClass) {
      setStudents([]);
      return;
    }

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const studentRoster = await getStudentsForSection(activeClass.sectionId);
        setStudents(studentRoster);

        // Fetch existing marks if any for this class/assessment
        const existing = await getExistingMarks(activeClass.subjectId, assessmentName) as any[];
        const marksMap: Record<string, string> = {};
        let publishedStatus = false;
        
        studentRoster.forEach((std) => {
          const matched = existing.find((e: any) => e.student_id === std.studentId);
          if (matched) {
            marksMap[std.studentId] = matched.marks_obtained.toString();
            setMaxMarks(Number(matched.max_marks));
            if (matched.is_published) publishedStatus = true;
          } else {
            marksMap[std.studentId] = "";
          }
        });
        
        setMarks(marksMap);
        setIsPublished(publishedStatus);
      } catch (err) {
        toast.error("Failed to load students list.");
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [activeClass, assessmentName]);

  const handleMarkChange = (studentId: string, val: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: val
    }));
  };

  const handleSave = async (publishAfterSave = false) => {
    if (!activeClass) {
      toast.error("Please select a class first.");
      return;
    }
    if (!assessmentName.trim()) {
      toast.error("Please specify an assessment name.");
      return;
    }

    setSaving(true);
    try {
      // Validate marks
      const marksList = students.map((std) => {
        const scoreStr = marks[std.studentId];
        const score = scoreStr === "" ? 0 : Number(scoreStr);
        if (isNaN(score) || score < 0 || score > maxMarks) {
          throw new Error(`Invalid score for ${std.studentName}. Must be between 0 and ${maxMarks}.`);
        }
        return {
          studentId: std.studentId,
          marksObtained: score
        };
      });

      const saveRes = await saveInternalMarks({
        subjectId: activeClass.subjectId,
        assessmentName: assessmentName.trim(),
        maxMarks,
        marksList,
        facultyProfileId: facultyId
      });

      if (!saveRes.success) {
        toast.error(saveRes.error || "Failed to save draft.");
        return;
      }

      if (publishAfterSave) {
        const pubRes = await publishInternalMarks({
          subjectId: activeClass.subjectId,
          sectionId: activeClass.sectionId,
          assessmentName: assessmentName.trim()
        });

        if (pubRes.success) {
          setIsPublished(true);
          toast.success("Marks successfully published to students!");
        } else {
          toast.error(pubRes.error || "Failed to publish marks.");
        }
      } else {
        toast.success("Draft saved successfully.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save marks.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Parameters</CardTitle>
          <CardDescription>Select class allocation and define assessment criteria.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="class-select">Select Class & Subject</Label>
            <Select value={selectedClassIndex} onValueChange={setSelectedClassIndex}>
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Select section..." />
              </SelectTrigger>
              <SelectContent>
                {classesList.map((cls, index) => (
                  <SelectItem key={cls.assignmentId} value={index.toString()}>
                    {cls.subjectName} ({cls.sectionLabel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assess-name">Assessment Name</Label>
            <Select value={assessmentName} onValueChange={setAssessmentName}>
              <SelectTrigger id="assess-name">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mid-1">Mid-Term Assessment 1</SelectItem>
                <SelectItem value="Mid-2">Mid-Term Assessment 2</SelectItem>
                <SelectItem value="Assignment-1">Assignment 1</SelectItem>
                <SelectItem value="Assignment-2">Assignment 2</SelectItem>
                <SelectItem value="Quiz-1">Quiz 1</SelectItem>
                <SelectItem value="Lab-Continuous-Evaluation">Lab Continuous Evaluation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-marks">Max Marks</Label>
            <Input 
              id="max-marks" 
              type="number" 
              value={maxMarks} 
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              min={1}
              disabled={isPublished}
            />
          </div>
        </CardContent>
      </Card>

      {activeClass && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle>Roster: {activeClass.sectionLabel}</CardTitle>
              <CardDescription>Enter marks for each student. Limits: 0 to {maxMarks}.</CardDescription>
            </div>
            {isPublished && (
              <Badge variant="default" className="flex items-center gap-1 font-semibold">
                <Check className="h-3.5 w-3.5" /> Published
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="text-center h-24 text-muted-foreground flex items-center justify-center">
                Loading students roster...
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[150px] text-right">Marks Obtained</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((std) => (
                      <TableRow key={std.studentId}>
                        <TableCell className="font-mono text-xs">{std.rollNumber}</TableCell>
                        <TableCell className="font-semibold">{std.studentName}</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            className="text-right w-[100px] inline-block font-bold text-primary"
                            value={marks[std.studentId] || ""}
                            onChange={(e) => handleMarkChange(std.studentId, e.target.value)}
                            max={maxMarks}
                            min={0}
                            step="0.5"
                            placeholder="score"
                            disabled={isPublished || saving}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSave(false)}
                    disabled={isPublished || saving}
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Draft
                  </Button>
                  <Button 
                    onClick={() => handleSave(true)}
                    disabled={isPublished || saving}
                  >
                    <Share2 className="h-4 w-4 mr-2" /> Publish to Students
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
