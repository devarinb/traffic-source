"use client";

import { useState, type ReactNode } from "react";

import {
  emptyStateClass,
  panelClass,
  panelHeaderClass,
  panelTabClass,
  panelTabsClass,
} from "@/lib/ui";

type AnalyticsRow = Record<string, unknown>;

type AnalyticsPanelProps = {
  tabs?: Array<{ key: string; label: string }>;
  data?: Record<string, AnalyticsRow[]> | AnalyticsRow[];
  valueKey?: string;
  labelKey?: string;
  defaultTab?: string;
  renderValue?: (
    value: number,
    row: AnalyticsRow,
    meta: { sharePct: number; barPct: number; activeTab: string },
  ) => ReactNode;
  renderLabel?: (
    row: AnalyticsRow,
    meta: { sharePct: number; barPct: number; activeTab: string },
  ) => ReactNode;
  showPercentage?: boolean;
  barByTotal?: boolean;
};

export default function AnalyticsPanel({
  tabs,
  data,
  valueKey = "count",
  labelKey = "name",
  defaultTab,
  renderValue,
  renderLabel,
  showPercentage = false,
  barByTotal = false,
}: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs?.[0]?.key || "");

  const activeData = Array.isArray(data)
    ? data
    : ((data?.[activeTab] as AnalyticsRow[] | undefined) ?? []);
  const totalValue = activeData.reduce(
    (sum, row) => sum + Number(row[valueKey] || 0),
    0,
  );
  const maxValue = Math.max(
    1,
    ...activeData.map((row) => Number(row[valueKey] || 0)),
  );

  return (
    <div className={panelClass}>
      <div className={panelHeaderClass}>
        <div className={panelTabsClass}>
          {tabs?.map((tab) => (
            <button
              key={tab.key}
              className={panelTabClass(activeTab === tab.key)}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
          Visitors &#x2195;
        </div>
      </div>
      <div>
        {activeData.length === 0 ? (
          <div className={emptyStateClass}>
            <p>No data yet</p>
          </div>
        ) : (
          activeData.map((row, index) => {
            const rowValue = Number(row[valueKey] || 0);
            const sharePct = totalValue > 0 ? (rowValue / totalValue) * 100 : 0;
            const barPct = barByTotal ? sharePct : (rowValue / maxValue) * 100;
            const displayValue = renderValue
              ? renderValue(rowValue, row, { sharePct, barPct, activeTab })
              : formatNumber(rowValue);

            return (
              <div
                key={index}
                className="relative flex h-10 items-center border-b border-[var(--border-light)] px-4 text-[13px] last:border-b-0 hover:bg-[var(--bg-card-hover)]"
              >
                <div
                  className="absolute inset-y-0 left-0 z-0 rounded-r-[4px] bg-[var(--bar-color)] transition-[width]"
                  style={{ width: `${barPct}%` }}
                />
                <div className="relative z-[1] flex flex-1 items-center gap-2 overflow-hidden pr-3 text-[13px] font-medium whitespace-nowrap text-ellipsis">
                  {renderLabel
                    ? renderLabel(row, { sharePct, barPct, activeTab })
                    : String(row[labelKey] ?? "")}
                </div>
                <div className="relative z-[1] flex min-w-[60px] items-center justify-end gap-1.5 text-right font-semibold [font-variant-numeric:tabular-nums]">
                  {displayValue}
                  {showPercentage && (
                    <span className="min-w-[52px] font-medium text-[var(--text-muted)]">
                      {formatPercent(sharePct)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString();
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  if (value >= 10) return `${value.toFixed(1)}%`;
  return `${value.toFixed(2)}%`;
}
