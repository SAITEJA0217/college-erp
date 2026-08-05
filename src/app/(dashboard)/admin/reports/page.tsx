import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDepartmentPerformance } from "@/features/internal-marks/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataExporter } from "@/components/reports/exporter";

export default async function AdminReportsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const supabase = await createClient();

  // 1. Fetch Faculty Workload data
  const { data: facultyWorkloadRaw } = await (supabase as any)
    .from("profiles")
    .select(`
      full_name,
      faculty ( designation, departments ( name ) ),
      faculty_class_assignments ( id )
    `)
    .eq("role", "faculty")
    .eq("is_archived", false);

  const facultyWorkloadReport = (facultyWorkloadRaw || []).map((f: any) => ({
    name: f.full_name,
    department: f.faculty?.[0]?.departments?.name || "Unassigned",
    designation: f.faculty?.[0]?.designation || "Assistant Professor",
    classesCount: f.faculty_class_assignments?.length || 0,
  }));

  // 2. Fetch Attendance averages per section
  const { data: attendanceRaw } = await (supabase as any)
    .from("attendance_records")
    .select(`
      status,
      attendance (
        section:sections (
          name,
          semester:semesters (
            semester_number,
            program:programs ( name )
          )
        )
      )
    `);

  const sectionAttendance: Record<string, { label: string; present: number; total: number }> = {};
  if (attendanceRaw) {
    (attendanceRaw as any[]).forEach((row: any) => {
      const sec = row.attendance?.section;
      if (!sec) return;
      const label = `${sec.semester?.program?.name} - Sem ${sec.semester?.semester_number} (Sec ${sec.name})`;
      if (!sectionAttendance[label]) {
        sectionAttendance[label] = { label, present: 0, total: 0 };
      }
      sectionAttendance[label].total += 1;
      if (row.status === "present") sectionAttendance[label].present += 1;
    });
  }
  const attendanceReport = Object.values(sectionAttendance).map((item) => ({
    section: item.label,
    totalSessions: item.total,
    averageAttendance: item.total === 0 ? 100 : Math.round((item.present / item.total) * 100),
  }));

  // 3. Fetch Grades Distribution count
  const { data: gradesRaw } = await (supabase as any)
    .from("results")
    .select("grade");

  const gradeCounts: Record<string, number> = { O: 0, "A+": 0, A: 0, "B+": 0, B: 0, C: 0, F: 0 };
  if (gradesRaw) {
    (gradesRaw as any[]).forEach((row: any) => {
      if (gradeCounts[row.grade] !== undefined) {
        gradeCounts[row.grade] += 1;
      }
    });
  }
  const gradesReport = Object.entries(gradeCounts).map(([grade, count]) => ({
    grade,
    count,
  }));

  // 4. Fetch Department statistics
  const { data: departmentsRaw } = await (supabase as any)
    .from("departments")
    .select(`
      code,
      name,
      students ( count ),
      faculty ( count )
    `);

  const departmentsReport = (departmentsRaw || []).map((d: any) => ({
    code: d.code,
    name: d.name,
    studentCount: d.students?.[0]?.count || 0,
    facultyCount: d.faculty?.[0]?.count || 0,
  }));

  // 5. Fetch Placements data
  const { data: placementRaw } = await (supabase as any)
    .from("placements")
    .select(`
      company_name,
      job_role,
      package_lpa,
      placement_applications ( count )
    `);

  const placementReport = (placementRaw || []).map((p: any) => ({
    company: p.company_name,
    role: p.job_role,
    packageLpa: p.package_lpa,
    applications: p.placement_applications?.[0]?.count || 0,
  }));

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Institutional Reports</h2>
          <p className="text-muted-foreground mt-1">
            Generate and export university statistics, performance curves, and attendance.
          </p>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="print:hidden">
          <TabsTrigger value="attendance">Attendance Overview</TabsTrigger>
          <TabsTrigger value="workload">Faculty Workload</TabsTrigger>
          <TabsTrigger value="grades">Grade Distributions</TabsTrigger>
          <TabsTrigger value="departments">Department Metrics</TabsTrigger>
          <TabsTrigger value="placements">Placements Drives</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attendance Report</CardTitle>
                <CardDescription>Average attendance percentage per academic section.</CardDescription>
              </div>
              <DataExporter tableId="attendance-table" filename="attendance_report" />
            </CardHeader>
            <CardContent>
              <Table id="attendance-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Total Checked Sessions</TableHead>
                    <TableHead className="text-right">Average Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceReport.map((row) => (
                    <TableRow key={row.section}>
                      <TableCell className="font-semibold">{row.section}</TableCell>
                      <TableCell className="text-right">{row.totalSessions}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{row.averageAttendance}%</TableCell>
                    </TableRow>
                  ))}
                  {attendanceReport.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        No checked attendance sessions recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Faculty Workload Report</CardTitle>
                <CardDescription>Academic workload and designations across university staff.</CardDescription>
              </div>
              <DataExporter tableId="workload-table" filename="faculty_workload_report" />
            </CardHeader>
            <CardContent>
              <Table id="workload-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Classes Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyWorkloadReport.map((row: any) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-semibold">{row.name}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell className="text-right font-bold">{row.classesCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grades Distribution</CardTitle>
                <CardDescription>Summary of letter grades awarded across all examinations.</CardDescription>
              </div>
              <DataExporter tableId="grades-table" filename="grades_distribution_report" />
            </CardHeader>
            <CardContent>
              <Table id="grades-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade Letter</TableHead>
                    <TableHead className="text-right">Count Issued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradesReport.map((row: any) => (
                    <TableRow key={row.grade}>
                      <TableCell className="font-bold text-lg">{row.grade}</TableCell>
                      <TableCell className="text-right font-semibold">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Department Statistics</CardTitle>
                <CardDescription>Registered student and faculty counts per department.</CardDescription>
              </div>
              <DataExporter tableId="departments-table" filename="departments_report" />
            </CardHeader>
            <CardContent>
              <Table id="departments-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Code</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Faculty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsReport.map((row: any) => (
                    <TableRow key={row.code}>
                      <TableCell className="font-mono text-xs font-semibold">{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right font-bold">{row.studentCount}</TableCell>
                      <TableCell className="text-right font-semibold">{row.facultyCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Placement Analytics</CardTitle>
                <CardDescription>Recruitment campaign drives and student application counts.</CardDescription>
              </div>
              <DataExporter tableId="placements-table" filename="placements_report" />
            </CardHeader>
            <CardContent>
              <Table id="placements-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead className="text-right">Compensation package</TableHead>
                    <TableHead className="text-right">Total Applications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placementReport.map((row: any) => (
                    <TableRow key={row.company}>
                      <TableCell className="font-semibold">{row.company}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell className="text-right">{row.packageLpa} LPA</TableCell>
                      <TableCell className="text-right font-bold text-primary">{row.applications}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
