"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/features/analytics/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, GraduationCap, Building2, TrendingUp, IndianRupee,
  ClipboardList, Award
} from "lucide-react";
import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Tooltip
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { metrics, charts } = data;

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

      {/* Row 2: Revenue Trend (full width) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-500" />
                Fee Revenue Forecast
              </CardTitle>
              <CardDescription>Projected revenue collection over the last 6 months (illustrative).</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">₹{(metrics.totalRevenue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">6-month total</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(v: any) => [`₹${(v / 100000).toFixed(2)}L`, "Revenue"]} />}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: "#10b981" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
