"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function ReportsClient({ chartData }: { chartData: any[] }) {

  const chartConfig = {
    students: {
      label: "Selected Students",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Placements by Department</CardTitle>
          <CardDescription>Number of students placed per department</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-h-[400px]">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="department"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="var(--color-students)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No placement data available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
