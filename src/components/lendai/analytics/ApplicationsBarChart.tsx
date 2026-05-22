import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyApplicationVolume } from "@/lib/analytics-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const chartConfig = {
  approved: {
    label: "Approved",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ApplicationsBarChart({ data }: { data: MonthlyApplicationVolume[] }) {
  return (
    <Card className="border-border/70 shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="text-base font-display">Application volume by month</CardTitle>
        <CardDescription>
          Stacked outcomes across the last seven months (mock portfolio data)
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 pr-4 pb-4">
        <ChartContainer config={chartConfig} className="h-[min(360px,50vh)] w-full aspect-auto">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="approved"
              stackId="a"
              fill="var(--color-approved)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill="var(--color-pending)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="rejected"
              stackId="a"
              fill="var(--color-rejected)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
