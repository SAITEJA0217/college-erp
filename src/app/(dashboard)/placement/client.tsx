"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, Users, Star, TrendingUp, Award } from "lucide-react";
import { format } from "date-fns";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis,
  LineChart, Line, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  applications: { label: "Applications", color: "#0ea5e9" },
  selected: { label: "Selected", color: "#10b981" },
  drives: { label: "Drives", color: "#8b5cf6" },
};

const STATUS_COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export function PlacementDashboardClient({
  kpis,
  drives,
  charts
}: {
  kpis: any;
  drives: any[];
  charts?: any;
}) {
  const selectionRate = kpis.totalApplications > 0
    ? Math.round((kpis.selectedStudents / kpis.totalApplications) * 100)
    : 0;

  const metricCards = [
    { label: "Active Drives", value: kpis.activeDrives, sub: "Ongoing recruitments", icon: Briefcase, color: "text-blue-500" },
    { label: "Total Applications", value: kpis.totalApplications, sub: "Across all drives", icon: Users, color: "text-purple-500" },
    { label: "Students Placed", value: kpis.selectedStudents, sub: "Confirmed offers", icon: Star, color: "text-green-500" },
    { label: "Selection Rate", value: `${selectionRate}%`, sub: "Offers / Applications", icon: Award, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Charts Row 1: Applications per Drive + Status Distribution */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Applications vs Selections per Drive</CardTitle>
            <CardDescription>Total applications and confirmed selections by company.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts?.driveApplications?.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.driveApplications} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="company" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="applications" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Applications" />
                    <Bar dataKey="selected" fill="#10b981" radius={[4, 4, 0, 0]} name="Selected" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No drive data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
            <CardDescription>Breakdown of all application outcomes.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts?.statusDistribution?.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="status"
                    >
                      {charts.statusDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value: any, name: any) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No application data yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Monthly Drive Trend + Recent Drives */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Monthly Drive Activity</CardTitle>
            <CardDescription>Campus drives launched over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts?.driveTrend?.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.driveTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="drives" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                No trend data available.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Campus Drives</CardTitle>
            <CardDescription>Latest company postings and deadlines.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drives.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No active drives found.</div>
              )}
              {drives.map((drive: any) => (
                <div key={drive.id} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                  <div className="bg-primary/10 p-2.5 rounded-lg mt-0.5">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{drive.company_name}</p>
                      <Badge variant={drive.placement_type === "internship" ? "secondary" : "default"} className="text-xs shrink-0">
                        {drive.placement_type === "internship" ? "Internship" : "Full-Time"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{drive.job_role}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span>CTC: {drive.ctc}</span>
                      <span>Min CGPA: {drive.eligibility_cgpa}</span>
                      <span>Deadline: {format(new Date(drive.application_deadline), "MMM d")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
