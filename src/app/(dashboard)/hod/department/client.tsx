"use client";

import { useState, useEffect } from "react";
import { getTimetableForSection } from "@/features/timetable/actions";
import { TimetableViewer, TimetableEvent } from "@/components/timetable/timetable-viewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Section, BookOpen } from "lucide-react";

export function HodDepartmentClient({ department }: { department: any }) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [timetableEvents, setTimetableEvents] = useState<TimetableEvent[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState<boolean>(false);

  // Flatten sections list for selector
  const allSections: { id: string; name: string; programName: string; semesterNumber: number }[] = [];
  
  department.programs?.forEach((prog: any) => {
    prog.semesters?.forEach((sem: any) => {
      sem.sections?.forEach((sec: any) => {
        allSections.push({
          id: sec.id,
          name: sec.name,
          programName: prog.name,
          semesterNumber: sem.semester_number,
        });
      });
    });
  });

  useEffect(() => {
    if (allSections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(allSections[0].id);
    }
  }, [allSections, selectedSectionId]);

  useEffect(() => {
    if (!selectedSectionId) return;
    setLoadingTimetable(true);
    getTimetableForSection(selectedSectionId).then((res) => {
      if (res.data) {
        setTimetableEvents(res.data as TimetableEvent[]);
      }
      setLoadingTimetable(false);
    });
  }, [selectedSectionId]);

  return (
    <div className="space-y-6">
      {/* Structural Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{department.programs?.length || 0}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {department.programs?.map((p: any) => (
                <Badge key={p.id} variant="secondary" className="text-[10px]">
                  {p.code}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Section className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSections.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all semesters and courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Department Code</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{department.code}</div>
            <p className="text-xs text-muted-foreground mt-1">{department.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Interactive Grid */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Section Timetables</CardTitle>
            <CardDescription>Select any section in your department to view its weekly schedule.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Label htmlFor="section-select" className="text-xs font-semibold shrink-0">Active Section:</Label>
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
              <SelectTrigger id="section-select" className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select section..." />
              </SelectTrigger>
              <SelectContent>
                {allSections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.programName} - Sem {sec.semesterNumber} (Sec {sec.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTimetable ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Loading weekly schedule...
            </div>
          ) : (
            <TimetableViewer events={timetableEvents} title="Department Weekly Schedule" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
