import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentTranscript } from "@/features/results/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, GraduationCap, Award, BookOpen } from "lucide-react";
import { ClientPrinterButton } from "./client-print";

export default async function StudentResultsPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const transcript = await getStudentTranscript(profile.id);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6 print:p-0">
      <div className="flex items-center justify-between space-y-2 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Grade Card</h2>
          <p className="text-muted-foreground mt-1">View end-semester examinations results and cumulative GPA.</p>
        </div>
        <div className="flex items-center gap-2">
          <ClientPrinterButton />
        </div>
      </div>

      {/* Institution header for printing */}
      <div className="hidden print:flex flex-col items-center text-center space-y-2 border-b pb-6 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">Malla Reddy University</h1>
        <p className="text-sm text-muted-foreground">Official Academic Grade Sheet</p>
        <div className="grid grid-cols-2 gap-4 text-left w-full mt-4 text-xs">
          <div><strong>Student Name:</strong> {profile.full_name}</div>
          <div><strong>Roll Number:</strong> {profile.employee_or_student_id}</div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {transcript && (
        <div className="space-y-6">
          {/* Transcript Summary */}
          <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cumulative GPA (CGPA)</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{transcript.cgpa}</div>
                <p className="text-xs text-muted-foreground mt-1">Weighted average across all semesters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Credits Completed</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{transcript.totalCredits}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered course credits completed</p>
              </CardContent>
            </Card>


          </div>

          {/* Semesters Grade Tables */}
          {transcript.semesters.map((sem: any) => (
            <Card key={sem.semesterNumber} className="print:border-none print:shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">Academic Transcript</CardTitle>
                  <CardDescription>Academic Period: {sem.academicYear}</CardDescription>
                </div>
                <Badge variant="outline" className="text-sm font-semibold">
                  SGPA: {sem.sgpa} (Credits: {sem.totalCredits})
                </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Subject Title</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-right font-mono">Score</TableHead>
                      <TableHead className="text-center">Grade Letter</TableHead>
                      <TableHead className="text-right">Grade Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sem.courses.map((course: any) => (
                      <TableRow key={course.subjectCode}>
                        <TableCell className="font-mono text-xs font-semibold">{course.subjectCode}</TableCell>
                        <TableCell className="font-medium">{course.subjectName}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-right font-mono">{course.obtained} / {course.max}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={course.grade === "F" ? "destructive" : "secondary"} className="font-bold">
                            {course.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{course.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!transcript || transcript.semesters?.length === 0) && (
        <div className="text-center py-24 text-muted-foreground border border-dashed rounded-lg bg-card/50">
          No official end-semester examinations results have been published for your profile yet.
        </div>
      )}
    </div>
  );
}
