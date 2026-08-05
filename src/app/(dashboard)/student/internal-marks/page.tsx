import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentInternalMarks } from "@/features/internal-marks/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function StudentInternalMarksPage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const marksList = await getStudentInternalMarks(profile.id);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Internal Evaluation Marks</h2>
          <p className="text-muted-foreground mt-1">
            Track your semester-wise continuous internal assessment (CIE) progress.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {marksList.map((subject: any) => {
          // Calculate aggregate percentage
          let totalObtained = 0;
          let totalMax = 0;
          subject.assessments.forEach((a: any) => {
            totalObtained += a.obtained;
            totalMax += a.max;
          });
          const aggregatePercentage = totalMax === 0 ? 0 : Math.round((totalObtained / totalMax) * 100);

          return (
            <Card key={subject.subjectCode}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                    <CardDescription>{subject.subjectCode}</CardDescription>
                  </div>
                  <Badge variant={aggregatePercentage >= 75 ? "default" : aggregatePercentage >= 50 ? "secondary" : "destructive"}>
                    CIE Agg: {aggregatePercentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex text-xs justify-between">
                    <span>Performance Progress</span>
                    <span className="font-bold">{totalObtained} / {totalMax} Marks</span>
                  </div>
                  <Progress value={aggregatePercentage} className="h-2" />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subject.assessments.map((a: any) => {
                      const percentage = a.max === 0 ? 0 : Math.round((a.obtained / a.max) * 100);
                      return (
                        <TableRow key={a.name}>
                          <TableCell className="font-medium">{a.name}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {a.obtained} / {a.max}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground font-semibold">
                            {percentage}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}

        {marksList.length === 0 && (
          <div className="md:col-span-2 text-center py-24 text-muted-foreground border border-dashed rounded-lg bg-card/50">
            No published internal assessment grades available for you yet.
          </div>
        )}
      </div>
    </div>
  );
}
