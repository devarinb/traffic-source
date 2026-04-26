"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/hooks/useChartTheme";
import { emptyStateClass } from "@/lib/ui";

type TimeSeriesDatum = {
  date: string;
  [key: string]: string | number;
};

export default function TimeSeriesChart({
  data,
  dataKey = "page_views",
  color = "#3b82f6",
}: {
  data?: TimeSeriesDatum[];
  dataKey?: string;
  color?: string;
  label?: string;
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
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: chartTheme.axis }}
            tickFormatter={(value: string) => {
              if (value.includes(" ")) return value.split(" ")[1];
              const date = new Date(`${value}T00:00:00`);
              return date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              });
            }}
          />
          <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} width={40} />
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
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
