"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, ClipboardCheck, BookOpen, TrendingUp, Star } from "lucide-react";
import { format } from "date-fns";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis,
  LineChart, Line, ResponsiveContainer, Tooltip,
  RadialBarChart, RadialBar, Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  attendance: { label: "Attendance %", color: "hsl(var(--primary))" },
  subjects: { label: "Subjects Assigned", color: "hsl(221, 83%, 53%)" },
  students: { label: "Students", color: "hsl(142, 71%, 45%)" },
};

export function HodDashboardClient({
  kpis,
  trends,
  notices,
  facultyWorkload,
  sectionData,
  avgMarks
}: {
  kpis: any;
  trends: any[];
  notices: any[];
  facultyWorkload?: any[];
  sectionData?: any[];
  avgMarks?: number;
}) {
  const metricCards = [
    { label: "Total Faculty", value: kpis.facultyCount, sub: "Active in department", icon: Users, color: "text-blue-500" },
    { label: "Total Students", value: kpis.studentCount, sub: "Enrolled in department", icon: GraduationCap, color: "text-green-500" },
    { label: "Avg Attendance", value: `${kpis.avgAttendance}%`, sub: "Across all subjects", icon: ClipboardCheck, color: "text-amber-500" },
    { label: "Assignments Given", value: kpis.assignmentCount, sub: "Cumulative assessments", icon: BookOpen, color: "text-purple-500" },
    { label: "Avg Assignment Score", value: `${avgMarks || 0}%`, sub: "Dept student average", icon: TrendingUp, color: "text-rose-500" },
    { label: "Performance Score", value: kpis.avgAttendance >= 75 ? "Good" : "Needs Attention", sub: "Overall dept health", icon: Star, color: kpis.avgAttendance >= 75 ? "text-green-500" : "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metricCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Attendance Trends + Faculty Workload */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily department attendance over the last 14 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      className="text-xs"
                    />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No attendance data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Faculty Workload</CardTitle>
            <CardDescription>Number of subjects assigned per faculty.</CardDescription>
          </CardHeader>
          <CardContent>
            {facultyWorkload && facultyWorkload.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facultyWorkload} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                    <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="subjects" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No faculty assignment data yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Section Distribution + Notices */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Student Distribution by Section</CardTitle>
            <CardDescription>Student headcount across all sections in the department.</CardDescription>
          </CardHeader>
          <CardContent>
            {sectionData && sectionData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="students" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                No section data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Notices</CardTitle>
            <CardDescription>Latest department and global announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notices.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No recent notices.</div>
              )}
              {notices.map((notice: any) => (
                <div key={notice.id} className="border-l-2 border-primary pl-3 space-y-1">
                  <p className="text-sm font-semibold leading-none">{notice.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notice.content}</p>
                  <Badge variant="outline" className="text-xs">
                    {format(new Date(notice.created_at), "MMM d, yyyy")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
