import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDepartmentPerformance } from "@/features/internal-marks/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function HodReportsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "hod") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: hodFaculty } = await (supabase as any)
    .from("faculty")
    .select("department_id")
    .eq("profile_id", profile.id)
    .single();

  if (!(hodFaculty as any)?.department_id) {
    return <div className="p-8 text-muted-foreground">No department assigned</div>;
  }

  const deptId = (hodFaculty as any).department_id;

  // 1. Fetch Faculty List with workload counts
  const { data: facultyData } = await (supabase as any)
    .from("profiles")
    .select(`
      id,
      full_name,
      faculty!inner (
        designation
      ),
      faculty_class_assignments:faculty_class_assignments (
        id
      )
    `)
    .eq("faculty.department_id", deptId)
    .eq("role", "faculty")
    .eq("is_archived", false);

  // 2. Fetch CIE performance averages
  const ciePerformance = await getDepartmentPerformance(deptId);

  // 3. Fetch student attendance records in this department
  const { data: attendanceRecords } = await (supabase as any)
    .from("attendance_records")
    .select(`
      status,
      student_id,
      student:students!inner (
        profiles!inner (
          full_name
        )
      ),
      attendance!inner (
        subject:subjects!inner (
          department_id
        )
      )
    `)
    .eq("attendance.subject.department_id", deptId);

  const studentAtt: Record<string, { name: string, present: number, total: number }> = {};
  
  if (attendanceRecords) {
    attendanceRecords.forEach((a: any) => {
      const studentId = a.student_id;
      const name = a.student?.profiles?.full_name || "Unknown Student";
      if (!studentAtt[studentId]) {
        studentAtt[studentId] = { name, present: 0, total: 0 };
      }
      studentAtt[studentId].total += 1;
      if (a.status === "present") studentAtt[studentId].present += 1;
    });
  }

  const lowAttendanceStudents = Object.entries(studentAtt)
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      percentage: stats.total === 0 ? 100 : Math.round((stats.present / stats.total) * 100)
    }))
    .filter(s => s.percentage < 75)
    .sort((a, b) => a.percentage - b.percentage);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Department Reports</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Workload</CardTitle>
            <CardDescription>Number of subjects assigned to department faculty.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Classes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyData?.map((fac: any) => (
                  <TableRow key={fac.id}>
                    <TableCell className="font-semibold">{fac.full_name}</TableCell>
                    <TableCell className="text-xs">{fac.faculty?.[0]?.designation || "Assistant Professor"}</TableCell>
                    <TableCell className="text-right font-bold">{fac.faculty_class_assignments?.length || 0}</TableCell>
                  </TableRow>
                ))}
                {(!facultyData || facultyData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      No faculty found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CIE Performance</CardTitle>
            <CardDescription>Continuous Internal Evaluation average per course.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead className="text-right">Average %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ciePerformance.map((course: any) => (
                  <TableRow key={course.code}>
                    <TableCell className="font-mono text-xs font-semibold">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{course.average}%</TableCell>
                  </TableRow>
                ))}
                {ciePerformance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      No marks published.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Attendance</CardTitle>
            <CardDescription>Students with attendance below 75%.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowAttendanceStudents.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-semibold">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Critical</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      {student.percentage}%
                    </TableCell>
                  </TableRow>
                ))}
                {lowAttendanceStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      No students below 75% attendance.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
