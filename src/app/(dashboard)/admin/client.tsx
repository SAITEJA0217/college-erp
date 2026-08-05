"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/features/analytics/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, GraduationCap, Building2, TrendingUp, IndianRupee,
  ClipboardList, Award, Bell
} from "lucide-react";
import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Tooltip
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

const chartConfig: ChartConfig = {
  count: { label: "Students", color: "#0ea5e9" },
  value: { label: "Applications", color: "#8b5cf6" },
  revenue: { label: "Revenue (₹)", color: "#10b981" },
};

function MetricSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <MetricSkeleton />
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="h-[340px]"><Skeleton className="h-full w-full mt-6" /></CardContent></Card>
          <Card><CardContent className="h-[340px]"><Skeleton className="h-full w-full mt-6" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const { metrics, charts, recentNotifications = [] } = data;

  const placementPct = metrics.totalStudents > 0
    ? Math.round(
        ((charts.placementData.find((d: any) => d.status === "Selected")?.value || 0) / metrics.totalStudents) * 100
      )
    : 0;

  const metricCards = [
    { label: "Total Students", value: metrics.totalStudents, sub: "Enrolled college-wide", icon: GraduationCap, color: "text-blue-500" },
    { label: "Total Faculty", value: metrics.totalFaculty, sub: "Active staff members", icon: Users, color: "text-purple-500" },
    { label: "Departments", value: metrics.totalDepartments, sub: "Academic departments", icon: Building2, color: "text-green-500" },
    { label: "Avg Attendance", value: `${metrics.overallAttendance}%`, sub: "College-wide average", icon: TrendingUp, color: "text-amber-500" },
    { label: "Assignments", value: metrics.totalAssignments, sub: "Total issued", icon: ClipboardList, color: "text-rose-500" },
    { label: "Placement %", value: `${placementPct}%`, sub: "Students with offers", icon: Award, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metricCards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
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

      {/* Row 1: Students by Dept + Placement Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
            <CardDescription>Enrollment distribution across all departments.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.studentsByDept.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.studentsByDept} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No department data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Placement Overview</CardTitle>
            <CardDescription>Application status distribution across all drives.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.placementData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.placementData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="status"
                    >
                      {charts.placementData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, name: any) => [v, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No placement data yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/students" className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-muted/50 transition-colors">
              <div className="rounded-full bg-blue-100 p-3 mb-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Manage Students</span>
            </Link>
            <Link href="/admin/faculty" className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-muted/50 transition-colors">
              <div className="rounded-full bg-purple-100 p-3 mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Manage Faculty</span>
            </Link>
            <Link href="/admin/timetable" className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-muted/50 transition-colors">
              <div className="rounded-full bg-green-100 p-3 mb-3">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">Timetable</span>
            </Link>
            <Link href="/admin/departments" className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-muted/50 transition-colors">
              <div className="rounded-full bg-amber-100 p-3 mb-3">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium">Departments</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" />
            Recent System Events
          </CardTitle>
          <CardDescription>Latest alerts and notifications generated by the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifications.length > 0 ? (
            <div className="space-y-4">
              {recentNotifications.map((note: any) => (
                <div key={note.id} className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
                  <div className="rounded-full p-2 bg-indigo-500/10 text-indigo-600 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{note.title}</h4>
                    {note.body && <p className="text-sm text-muted-foreground mt-1">{note.body}</p>}
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No recent notifications found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
