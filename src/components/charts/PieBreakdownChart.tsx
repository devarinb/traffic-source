"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useChartTheme } from "@/hooks/useChartTheme";
import { emptyStateClass } from "@/lib/ui";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

type PieBreakdownDatum = {
  name: string;
  [key: string]: string | number;
};

export default function PieBreakdownChart({
  data,
  dataKey = "count",
}: {
  data?: PieBreakdownDatum[];
  dataKey?: string;
}) {
  const chartTheme = useChartTheme();

  if (!data?.length) {
    return (
      <div className={emptyStateClass}>
        <p>No data for this period</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.slice(0, 8)}
            dataKey={dataKey}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.slice(0, 8).map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 13,
              color: chartTheme.tooltipText,
              boxShadow: chartTheme.tooltipShadow,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span style={{ color: chartTheme.tooltipText }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
