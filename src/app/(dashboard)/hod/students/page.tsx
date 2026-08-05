import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDepartmentStudents } from "@/features/hod/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function HodStudentsPage() {
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

  const studentsList = await getDepartmentStudents((hodFaculty as any).department_id);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Department Students</h2>
          <p className="text-muted-foreground mt-1">View student progress and records for your department.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>All enrolled students belonging to your department.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Batch Year</TableHead>
                <TableHead>Credits Completed</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsList.map((stud: any) => (
                <TableRow key={stud.id}>
                  <TableCell className="font-mono text-xs font-semibold">{stud.roll_number}</TableCell>
                  <TableCell className="font-semibold">{stud.full_name}</TableCell>
                  <TableCell className="text-xs">{stud.email}</TableCell>
                  <TableCell>{stud.semester}</TableCell>
                  <TableCell>{stud.section}</TableCell>
                  <TableCell>{stud.batch_year}</TableCell>
                  <TableCell>{stud.credits_completed}</TableCell>
                  <TableCell className="font-bold text-primary">{stud.current_cgpa}</TableCell>
                  <TableCell>{stud.mentor_name}</TableCell>
                  <TableCell>
                    <Badge variant={stud.is_active ? "default" : "secondary"}>
                      {stud.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {studentsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-24 text-muted-foreground">
                    No students found in this department.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
