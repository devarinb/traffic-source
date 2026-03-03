import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name) => s.getPropertyValue(name).trim();
    return {
      grid: v('--chart-grid'),
      axis: v('--chart-axis'),
      axisLine: v('--chart-axis-line'),
      tooltipBg: v('--chart-tooltip-bg'),
      tooltipBorder: v('--chart-tooltip-border'),
      tooltipText: v('--chart-tooltip-text'),
      tooltipLabel: v('--chart-tooltip-label'),
      tooltipShadow: v('--chart-tooltip-shadow'),
      barPrimary: v('--chart-bar-primary'),
      barSecondary: v('--chart-bar-secondary'),
      barRevenue: v('--chart-bar-revenue'),
    };
  }, [theme]);
}
