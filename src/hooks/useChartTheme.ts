"use client";

import { useMemo } from "react";

import { useTheme } from "@/contexts/ThemeContext";

export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    void theme;
    const styles = getComputedStyle(document.documentElement);
    const value = (name: string) => styles.getPropertyValue(name).trim();

    return {
      grid: value("--chart-grid"),
      axis: value("--chart-axis"),
      axisLine: value("--chart-axis-line"),
      tooltipBg: value("--chart-tooltip-bg"),
      tooltipBorder: value("--chart-tooltip-border"),
      tooltipText: value("--chart-tooltip-text"),
      tooltipLabel: value("--chart-tooltip-label"),
      tooltipShadow: value("--chart-tooltip-shadow"),
      barPrimary: value("--chart-bar-primary"),
      barSecondary: value("--chart-bar-secondary"),
      barRevenue: value("--chart-bar-revenue"),
    };
  }, [theme]);
}
