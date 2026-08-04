import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { getStudentAttendanceAnalytics } from "@/features/attendance/student-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function StudentAttendancePage() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data, error } = await getStudentAttendanceAnalytics();

  if (error || !data) {
    return <div className="p-8 text-destructive">Failed to load attendance data.</div>;
  }

  const { summary, subjectBreakdown, recentLogs } = data;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">Monitor your overall and subject-wise attendance statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Overall Percentage */}
        <Card className="border-primary/20 bg-primary/5 col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center items-center p-6 text-center">
          <ClipboardCheck className="h-10 w-10 text-primary mb-2 opacity-80" />
          <h2 className="text-5xl font-black text-primary tracking-tighter">{summary.overallPercentage}%</h2>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-1">Overall Attendance</p>
          {summary.overallPercentage < 75 && (
            <Badge variant="destructive" className="mt-4"><AlertTriangle className="h-3 w-3 mr-1" /> Critical Danger</Badge>
          )}
        </Card>

        {/* Stats Grid */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Semester Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-muted/30 p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold">{summary.totalClasses}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Classes</div>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.presentClasses}</div>
                <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase tracking-wider font-semibold mt-1">Attended</div>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.absentClasses}</div>
                <div className="text-xs text-red-600/70 dark:text-red-400/70 uppercase tracking-wider font-semibold mt-1">Missed</div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.lateClasses}</div>
                <div className="text-xs text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider font-semibold mt-1">Late</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Subject Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subject-wise Breakdown</CardTitle>
            <CardDescription>Detailed attendance statistics for your current subjects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjectBreakdown.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No attendance records found yet.</div>
            ) : (
              subjectBreakdown.map((sub, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-base">{sub.subject}</div>
                      <div className="text-xs text-muted-foreground">{sub.code} • {sub.total} Classes</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{sub.percentage}%</div>
                      <div className="text-xs text-muted-foreground">{sub.present + sub.late} / {sub.total} Attended</div>
                    </div>
                  </div>
                  <Progress value={sub.percentage} className="h-2" />
                  <div className="flex gap-2 text-xs">
                    {sub.percentage < 75 && <span className="text-destructive font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Needs Attention</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No recent logs.</div>
            ) : (
              recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                  <div className="mt-0.5">
                    {log.status === "present" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {log.status === "absent" && <XCircle className="h-5 w-5 text-red-500" />}
                    {log.status === "late" && <Clock className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm line-clamp-1">{log.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{format(parseISO(log.date), "MMM d, yyyy")}</div>
                  </div>
                  <Badge variant="outline" className={`capitalize ${log.status === "present" ? "text-green-600 border-green-200" : log.status === "absent" ? "text-red-600 border-red-200" : "text-amber-600 border-amber-200"}`}>
                    {log.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
