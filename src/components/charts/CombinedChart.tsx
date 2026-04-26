"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/hooks/useChartTheme";
import { emptyStateClass } from "@/lib/ui";

type ChartDatum = {
  date: string;
  visitors: number;
  page_views: number;
  revenue: number;
  sessions?: number;
};

type CombinedChartProps = {
  trafficData?: Array<Record<string, number | string>>;
  revenueData?: Array<Record<string, number | string>>;
};

export default function CombinedChart({
  trafficData,
  revenueData,
}: CombinedChartProps) {
  const chartTheme = useChartTheme();
  const merged = mergeByDate(trafficData, revenueData);

  if (!merged.length) {
    return (
      <div className={emptyStateClass}>
        <p>No data for this period</p>
      </div>
    );
  }

  const hasRevenue = merged.some((item) => item.revenue > 0);
  const hasVisitors = merged.some((item) => item.visitors > 0);

  return (
    <div className="h-80 w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={merged}
          margin={{ top: 10, right: hasRevenue ? 50 : 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: chartTheme.axis }}
            tickLine={false}
            axisLine={{ stroke: chartTheme.axisLine }}
            tickFormatter={(value: string) => {
              if (value.includes(" ")) return value.split(" ")[1];
              const date = new Date(`${value}T00:00:00`);
              return date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              });
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: chartTheme.axis }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          {hasRevenue && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: chartTheme.axis }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value: number) => `$${(value / 100).toFixed(0)}`}
            />
          )}
          <Tooltip
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 13,
              color: chartTheme.tooltipText,
              boxShadow: chartTheme.tooltipShadow,
            }}
            itemStyle={{ color: chartTheme.tooltipText }}
            labelStyle={{ color: chartTheme.tooltipLabel }}
            formatter={(value, name) => {
              const numericValue = Number(value || 0);
              if (name === "revenue") return [`$${(numericValue / 100).toFixed(2)}`, "Revenue"];
              if (name === "page_views") return [numericValue.toLocaleString(), "Pageviews"];
              if (name === "visitors") return [numericValue.toLocaleString(), "Visitors"];
              return [numericValue.toLocaleString(), String(name)];
            }}
          />
          {hasRevenue && (
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill={chartTheme.barRevenue}
              radius={[4, 4, 0, 0]}
              barSize={20}
              opacity={0.75}
            />
          )}
          <Bar
            yAxisId="left"
            dataKey="page_views"
            fill={chartTheme.barPrimary}
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          {hasVisitors && (
            <Bar
              yAxisId="left"
              dataKey="visitors"
              fill={chartTheme.barSecondary}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function mergeByDate(
  traffic: Array<Record<string, number | string>> = [],
  revenue: Array<Record<string, number | string>> = [],
) {
  const map: Record<string, ChartDatum> = {};

  for (const entry of traffic) {
    const date = String(entry.date || "");
    map[date] = {
      date,
      revenue: 0,
      page_views: Number(entry.page_views || 0),
      sessions: Number(entry.sessions || 0),
      visitors: Number(entry.visitors || 0),
    };
  }

  for (const entry of revenue) {
    const date = String(entry.date || "");
    if (map[date]) {
      map[date].revenue = Number(entry.revenue || 0);
    } else {
      map[date] = {
        date,
        page_views: 0,
        revenue: Number(entry.revenue || 0),
        sessions: 0,
        visitors: 0,
      };
    }
  }

  return Object.values(map).sort((left, right) => left.date.localeCompare(right.date));
}
