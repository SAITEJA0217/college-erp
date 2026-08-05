"use client";

import { AppModal } from "@/components/overlays/app-modal";
import { AssignedClass, FacultyProfileInfo } from "@/features/faculty/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, BookOpen, ChevronRight, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ClassDetailsModalProps {
  cls: AssignedClass | null;
  faculty: FacultyProfileInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassDetailsModal({ cls, faculty, open, onOpenChange }: ClassDetailsModalProps) {
  if (!cls) return null;

  return (
    <AppModal
      title="Class Details"
      description={`Detailed view for ${cls.subject_code} - ${cls.subject_name}`}
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-3xl"
    >
      <div className="flex flex-col gap-6">
        {/* Class Identity Header */}
        <div className="flex items-start justify-between p-4 border rounded-xl bg-card">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{cls.subject_name}</h2>
              <Badge variant={cls.status === "Active" ? "default" : "secondary"}>
                {cls.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{cls.subject_code}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <span className="text-sm font-medium">{cls.section_name}</span>
            <span className="text-xs text-muted-foreground">Semester {cls.semester_number}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3" /> Credits</span>
            <span className="font-semibold">{cls.credits}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Weekly Hours</span>
            <span className="font-semibold">{cls.weekly_hours}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Student Strength</span>
            <span className="font-semibold">{cls.students_count}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Academic Year</span>
            <span className="font-semibold">{cls.academic_year_name}</span>
          </div>
        </div>

        {/* Academic Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 flex flex-col gap-2">
            <h3 className="text-sm font-semibold mb-1">Academic Context</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium text-right">{cls.department_name}</span>
              <span className="text-muted-foreground">Program:</span>
              <span className="font-medium text-right">{cls.program_name}</span>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex flex-col gap-2">
            <h3 className="text-sm font-semibold mb-1">Faculty Assignment</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Instructor:</span>
              <span className="font-medium text-right">{faculty?.full_name}</span>
              <span className="text-muted-foreground">ID:</span>
              <span className="font-medium font-mono text-right">{faculty?.employee_or_student_id}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (TODO integrations) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-between h-auto py-3" asChild>
              <Link href={`/faculty/attendance?class=${cls.id}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <div className="flex flex-col items-start">
                    <span>Mark Attendance</span>
                    <span className="text-xs font-normal text-muted-foreground">Record daily attendance</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-auto py-3" asChild>
              <Link href={`/faculty/assignments?class=${cls.id}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div className="flex flex-col items-start">
                    <span>Assignments</span>
                    <span className="text-xs font-normal text-muted-foreground">Manage coursework</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between h-auto py-3" asChild>
              <Link href={`/faculty/notes?class=${cls.id}`}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <div className="flex flex-col items-start">
                    <span>Study Materials</span>
                    <span className="text-xs font-normal text-muted-foreground">Upload resources</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
            {/* Additional module hooks can go here in the future */}
          </div>
        </div>
      </div>
    </AppModal>
  );
}
