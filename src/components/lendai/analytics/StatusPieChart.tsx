import { Cell, Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ApplicationStatusSlice, LendingAnalyticsSummary } from "@/lib/analytics-data";
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

export function StatusPieChart({
  data,
  summary,
}: {
  data: ApplicationStatusSlice[];
  summary: LendingAnalyticsSummary;
}) {
  const pieData = data.map((d) => ({
    ...d,
    fill: `var(--color-${d.status})`,
  }));

  return (
    <Card className="border-border/70 shadow-[var(--shadow-elegant)] h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-display">Status distribution</CardTitle>
        <CardDescription>Share of applications by final decision state</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[min(320px,45vh)] w-full max-w-[340px] aspect-square"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="label"
              innerRadius={72}
              outerRadius={110}
              paddingAngle={2}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {pieData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 8}
                          className="fill-foreground text-2xl font-display font-semibold"
                        >
                          {summary.totalApplications.toLocaleString("en-IN")}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          Total apps
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="-translate-y-2 flex-wrap gap-2 justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
