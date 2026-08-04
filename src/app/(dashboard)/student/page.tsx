import { getUserProfile } from "@/features/auth/user";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Calendar, GraduationCap, ClipboardList, Bell } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const profile = await getUserProfile();
  
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  // Mock data for MVP
  const attendance = 85;
  const todayClasses = [
    { time: "09:00 AM", subject: "Data Structures", room: "CS-101" },
    { time: "11:30 AM", subject: "Computer Networks", room: "CS-102" },
  ];
  const pendingAssignments = [
    { title: "Binary Trees Assignment", due: "Tomorrow" },
    { title: "Network Protocols Essay", due: "In 3 Days" },
  ];
  const upcomingQuiz = { subject: "Data Structures", topic: "Graphs", date: "Next Monday" };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.full_name?.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your academics today.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Card (Bento Style) */}
        <Card className="col-span-1 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Overall Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-primary">{attendance}%</div>
              <Badge variant={attendance > 75 ? "default" : "destructive"}>
                {attendance > 75 ? "On Track" : "Action Needed"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="col-span-1 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap className="h-32 w-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Student Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium w-24">Student ID:</span>
              <span className="text-muted-foreground">{profile.employee_or_student_id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium w-24">Email:</span>
              <span className="text-muted-foreground">{profile.email}</span>
            </div>
            <div className="pt-2">
              <Link href="/student/profile" className="text-sm text-primary hover:underline font-medium">
                View Full Profile &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Classes */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" /> Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayClasses.map((cls, i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                <div className="font-semibold text-sm w-16 shrink-0">{cls.time}</div>
                <div>
                  <div className="font-medium">{cls.subject}</div>
                  <div className="text-xs text-muted-foreground">Room: {cls.room}</div>
                </div>
              </div>
            ))}
            {todayClasses.length === 0 && <p className="text-sm text-muted-foreground">No classes today.</p>}
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" /> Assignments Due
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAssignments.map((ass, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="font-medium text-sm">{ass.title}</div>
                <Badge variant="secondary" className="text-xs">{ass.due}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quiz & Notifications Stack */}
        <div className="col-span-1 flex flex-col gap-4">
          <Card className="flex-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-indigo-500" /> Upcoming Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-semibold">{upcomingQuiz.subject}</div>
              <div className="text-sm text-muted-foreground mb-2">Topic: {upcomingQuiz.topic}</div>
              <Badge className="bg-indigo-500 hover:bg-indigo-600">{upcomingQuiz.date}</Badge>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" /> Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">You are all caught up!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
