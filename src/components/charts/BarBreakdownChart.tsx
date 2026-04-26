"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/hooks/useChartTheme";
import { emptyStateClass } from "@/lib/ui";

type BarBreakdownDatum = {
  name: string;
  [key: string]: string | number;
};

export default function BarBreakdownChart({
  data,
  dataKey = "count",
  color = "#3b82f6",
}: {
  data?: BarBreakdownDatum[];
  dataKey?: string;
  color?: string;
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
        <BarChart
          data={data.slice(0, 10)}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid}
            horizontal={false}
          />
          <XAxis type="number" tick={{ fontSize: 11, fill: chartTheme.axis }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: chartTheme.axis }}
            width={70}
          />
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
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
