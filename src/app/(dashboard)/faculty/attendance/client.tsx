"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { getStudentsForSection, getAttendanceRecord, saveAttendanceRecord } from "@/features/attendance/faculty-actions";
import { Loader2, Users, Save, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";

type AssignedSubject = {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  section_id: string;
  section_name: string;
  semester_number: number;
  program_name: string;
  department_name: string;
};

type Student = {
  profile_id: string;
  roll_number: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
};

export function AttendanceClient({ initialSubjects }: { initialSubjects: AssignedSubject[] }) {
  const [selectedClassStr, setSelectedClassStr] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Mapping of student_id -> status
  const [attendanceState, setAttendanceState] = useState<Record<string, "present" | "absent" | "late">>({});

  const loadAttendance = async () => {
    if (!selectedClassStr || !date) return;
    
    setLoading(true);
    const [subjectId, sectionId] = selectedClassStr.split("|");
    
    // 1. Fetch Students
    const { data: stdData, error: stdErr } = await getStudentsForSection(sectionId);
    if (stdErr) {
      toast.error(stdErr);
      setLoading(false);
      return;
    }
    
    const fetchedStudents = stdData || [];
    setStudents(fetchedStudents);

    // 2. Fetch existing records
    const { data: attData, error: attErr } = await getAttendanceRecord(sectionId, subjectId, date);
    
    const newState: Record<string, "present" | "absent" | "late"> = {};
    
    if (attData && attData.attendance_records) {
      // Load existing state
      (attData.attendance_records as any[]).forEach((r: any) => {
        newState[r.student_id] = r.status;
      });
    } else {
      // Default to Present
      fetchedStudents.forEach((s: Student) => {
        newState[s.profile_id] = "present";
      });
    }
    
    setAttendanceState(newState);
    setLoading(false);
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedClassStr, date]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleBulkMark = (status: "present" | "absent" | "late") => {
    const newState = { ...attendanceState };
    students.forEach((s: Student) => {
      newState[s.profile_id] = status;
    });
    setAttendanceState(newState);
  };

  const handleSave = async () => {
    if (!selectedClassStr || !date) return;
    setSaving(true);
    
    const [subjectId, sectionId] = selectedClassStr.split("|");
    const recordsToSave = Object.keys(attendanceState).map((student_id) => ({
      student_id,
      status: attendanceState[student_id],
    }));

    const result = await saveAttendanceRecord(sectionId, subjectId, date, recordsToSave);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Attendance saved successfully!");
    }
    
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>Select Class (Subject & Section)</Label>
              <select value={selectedClassStr} onChange={(e) => setSelectedClassStr(e.target.value)} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                <option value="">Choose a class...</option>
                {initialSubjects.map((s, i) => (
                  <option key={i} value={`${s.subject_id}|${s.section_id}`}>
                    {s.subject_code} - {s.subject_name} ({s.section_name})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-[200px] space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={format(new Date(), "yyyy-MM-dd")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : selectedClassStr && students.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Enrolled Students ({students.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkMark("present")}>Mark All Present</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Attendance
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {students.map((student) => {
                const status = attendanceState[student.profile_id] || "present";
                return (
                  <div key={student.profile_id} className={`flex flex-col gap-3 rounded-lg border p-3 transition-colors ${status === "present" ? "border-green-500/30 bg-green-500/5" : status === "absent" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                    <div>
                      <div className="font-semibold text-sm truncate" title={student.profiles.full_name}>{student.profiles.full_name}</div>
                      <div className="text-xs text-muted-foreground">{student.roll_number}</div>
                    </div>
                    <div className="flex items-center justify-between gap-1 bg-background rounded p-1 border">
                      <button
                        onClick={() => handleStatusChange(student.profile_id, "present")}
                        className={`flex-1 flex justify-center py-1.5 rounded transition-all ${status === "present" ? "bg-green-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                        title="Present"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.profile_id, "late")}
                        className={`flex-1 flex justify-center py-1.5 rounded transition-all ${status === "late" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                        title="Late"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.profile_id, "absent")}
                        className={`flex-1 flex justify-center py-1.5 rounded transition-all ${status === "absent" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                        title="Absent"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : selectedClassStr ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No students found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">There are no students enrolled in this section. Please contact administration.</p>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">Ready to take attendance</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">Select a class from the dropdown above to begin marking attendance.</p>
        </Card>
      )}
    </div>
  );
}
