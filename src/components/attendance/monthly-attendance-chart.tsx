"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DaySummary } from "@/hooks/use-attendance-charts";

const STATUS_COLORS: Record<string, string> = {
  present: "#22c55e",
  absent: "#ef4444",
  late: "#eab308",
  excused: "#a855f7",
  holiday: "#64748b",
};

const STATUS_KEYS = ["present", "absent", "late", "excused", "holiday"] as const;

type MonthlyAttendanceChartProps = {
  days: DaySummary[];
};

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MonthlyAttendanceChart({ days }: MonthlyAttendanceChartProps) {
  const chartData = days.map((day) => {
    const row: Record<string, string | number> = {
      date: formatDay(day.date),
      fullDate: day.date,
      total: day.total,
    };
    for (const key of STATUS_KEYS) {
      row[key] = day.byStatus[key] ?? 0;
    }
    return row;
  });

  if (chartData.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        No attendance data for this month
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
            }}
            formatter={(value: number) => [value, ""]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullDate
                ? formatDay(payload[0].payload.fullDate as string)
                : ""
            }
          />
          {STATUS_KEYS.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={STATUS_COLORS[key] ?? "#94a3b8"}
              radius={[0, 0, 0, 0]}
              name={key.charAt(0).toUpperCase() + key.slice(1)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
