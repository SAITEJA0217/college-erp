import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDepartmentFaculty } from "@/features/hod/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function HodFacultyPage() {
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

  const facultyList = await getDepartmentFaculty((hodFaculty as any).department_id);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Department Faculty</h2>
          <p className="text-muted-foreground mt-1">Manage and view teaching staff in your department.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Roster</CardTitle>
          <CardDescription>All registered academic instructors belonging to your department.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facultyList.map((fac: any) => (
                <TableRow key={fac.id}>
                  <TableCell className="font-semibold">{fac.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">{fac.employee_id}</TableCell>
                  <TableCell>{fac.designation}</TableCell>
                  <TableCell>{fac.qualification}</TableCell>
                  <TableCell>{fac.specialization}</TableCell>
                  <TableCell>{fac.joining_date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{fac.employment_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={fac.is_active ? "default" : "secondary"}>
                      {fac.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {facultyList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No faculty found in this department.
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
