"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  present: "#22c55e",
  absent: "#ef4444",
  late: "#eab308",
  excused: "#a855f7",
  holiday: "#64748b",
};

type AttendanceSummaryChartProps = {
  byStatus: Record<string, number>;
  total: number;
};

export function AttendanceSummaryChart({
  byStatus = {},
  total = 0,
}: AttendanceSummaryChartProps) {
  const data = Object.entries(byStatus ?? {})
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: STATUS_COLORS[name] ?? "#94a3b8",
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        No attendance marked for this date
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            label={({ name, value }) =>
              `${name}: ${value}${total > 0 ? ` (${Math.round((value / total) * 100)}%)` : ""}`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              value,
              total > 0 ? `${Math.round((value / total) * 100)}%` : "",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
