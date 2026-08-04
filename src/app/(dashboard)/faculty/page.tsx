import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Users, ClipboardCheck, Bell, Briefcase } from "lucide-react";
import Link from "next/link";

export default async function FacultyDashboard() {
  const profile = await getUserProfile();
  
  if (!profile || profile.role !== "faculty") {
    redirect("/login");
  }

  // Mock data for MVP Overview
  const todayClasses = [
    { time: "09:00 AM", subject: "Data Structures", section: "CSE - 2A", room: "CS-101", attendanceMarked: true },
    { time: "11:30 AM", subject: "Computer Networks", section: "CSE - 2B", room: "CS-102", attendanceMarked: false },
  ];
  
  const pendingTasks = [
    { type: "attendance", text: "Mark Attendance for Computer Networks (CSE-2B)" },
    { type: "grading", text: "Grade 14 Submissions for Data Structures Assignment" },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, Prof. {profile.full_name?.split(" ").pop()} 👋</h1>
          <p className="text-muted-foreground">Here is your teaching schedule and pending tasks for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/faculty/attendance">
            <Button><ClipboardCheck className="mr-2 h-4 w-4" /> Mark Attendance</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Stats Card */}
        <Card className="col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Faculty Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium w-24">Employee ID:</span>
              <span className="text-muted-foreground font-semibold">{profile.employee_or_student_id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium w-24">Role:</span>
              <span className="text-muted-foreground">Assistant Professor</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium w-24">Email:</span>
              <span className="text-muted-foreground">{profile.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="col-span-1 lg:col-span-2 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 p-8 opacity-10">
            <Users className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overview Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center mt-2">
              <div>
                <div className="text-3xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Assigned Subjects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">120</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Active Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" /> Today's Lectures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayClasses.map((cls, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="font-bold text-primary w-20 shrink-0">{cls.time}</div>
                  <div>
                    <div className="font-semibold text-lg">{cls.subject}</div>
                    <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cls.section}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Room: {cls.room}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {cls.attendanceMarked ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Attendance Marked</Badge>
                  ) : (
                    <Badge variant="destructive">Pending Attendance</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Center */}
        <div className="col-span-1 flex flex-col gap-4">
          <Card className="flex-1 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-amber-500" /> Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task, i) => (
                <div key={i} className="text-sm p-3 rounded bg-background/50 border border-amber-500/20 font-medium shadow-sm">
                  {task.text}
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" /> Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
               <Link href="/faculty/assignments" className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-muted transition-colors text-xs font-semibold text-center h-20">
                 <FileText className="h-5 w-5 mb-1" /> Assignments
               </Link>
               <Link href="/faculty/classes" className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-muted transition-colors text-xs font-semibold text-center h-20">
                 <BookOpen className="h-5 w-5 mb-1" /> Notes Upload
               </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Temporary icon to avoid build error
function FileText(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
}
