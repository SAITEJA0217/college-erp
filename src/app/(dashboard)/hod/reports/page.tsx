import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  if (!hodFaculty?.department_id) {
    return <div>No department assigned</div>;
  }

  const deptId = hodFaculty.department_id;

  // Fetch Faculty List with count of subjects they teach
  const { data: facultyData } = await (supabase as any)
    .from("faculty")
    .select(`
      id,
      users ( full_name, email ),
      designation,
      faculty_subjects ( count )
    `)
    .eq("department_id", deptId);

  // Fetch Students with low attendance (e.g. < 75%)
  // This is a naive implementation; ideally we calculate this in a materialized view
  // For the prototype, we will just fetch students in the department and their raw attendance
  const { data: attendanceData } = await (supabase as any)
    .from("attendance")
    .select(`
      status,
      student_id,
      subjects!inner(department_id),
      students!inner(users(full_name))
    `)
    .eq("subjects.department_id", deptId);

  const studentAtt: Record<string, { name: string, present: number, total: number }> = {};
  
  if (attendanceData) {
    attendanceData.forEach((a: any) => {
      if (!studentAtt[a.student_id]) {
        studentAtt[a.student_id] = { name: a.students.users.full_name, present: 0, total: 0 };
      }
      studentAtt[a.student_id].total += 1;
      if (a.status === "present") studentAtt[a.student_id].present += 1;
    });
  }

  const lowAttendanceStudents = Object.entries(studentAtt)
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      percentage: Math.round((stats.present / stats.total) * 100)
    }))
    .filter(s => s.percentage < 75)
    .sort((a, b) => a.percentage - b.percentage);


  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Department Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Workload</CardTitle>
            <CardDescription>Number of subjects assigned to faculty in your department.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Subjects Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyData?.map((faculty: any) => (
                  <TableRow key={faculty.id}>
                    <TableCell className="font-medium">{faculty.users?.full_name}</TableCell>
                    <TableCell>{faculty.designation}</TableCell>
                    <TableCell className="text-right">{faculty.faculty_subjects[0]?.count || 0}</TableCell>
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
                    <TableCell className="font-medium">{student.name}</TableCell>
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
                      No students with critical attendance.
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
