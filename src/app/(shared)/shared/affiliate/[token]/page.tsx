"use client";

import { useCallback, useEffect, useState } from "react";

import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import { useAppRouter } from "@/hooks/useAppRouter";
import { loadingInlineClass, loadingSpinnerClass, panelClass } from "@/lib/ui";

const PERIODS = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

type SharedData = {
  affiliate: { name: string; commission_rate: number };
  site: { name: string };
  stats: {
    visits: number;
    uniqueVisitors: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    commission: number;
  };
  visitTimeSeries?: Array<Record<string, string | number>>;
  landingPages?: Array<{ name: string; count: number }>;
};

export default function SharedAffiliatePage() {
  const router = useAppRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30d");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shared/affiliate/${token}?period=${period}`);
      if (!res.ok) {
        setError(res.status === 404 ? "This link is no longer valid." : "Something went wrong.");
        setData(null);
      } else {
        setData((await res.json()) as SharedData);
        setError(null);
      }
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-5 py-10 text-[var(--text)]">
        <div className="mx-auto max-w-[860px]">
          <div className={loadingInlineClass}>
            <div className={loadingSpinnerClass} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-5 py-10 text-[var(--text)]">
        <div className="mx-auto max-w-[860px]">
          <div className="px-5 py-20 text-center text-[16px] text-[var(--text-muted)]">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const { affiliate, site, stats } = data;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 py-10 text-[var(--text)]">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-[24px] font-bold text-[var(--text-heading)]">
              {affiliate.name}
            </h1>
            <p className="text-[14px] text-[var(--text-muted)]">
              Partner dashboard for {site.name}
            </p>
          </div>
          <div className="flex gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-elevated)] p-[3px]">
            {PERIODS.map((item) => (
              <button
                key={item.value}
                className={`cursor-pointer rounded-[calc(var(--radius)-2px)] px-[14px] py-1.5 text-[13px] font-medium ${
                  period === item.value
                    ? "bg-[var(--bg-card)] text-[var(--text-heading)] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
                onClick={() => setPeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {[
            { label: "Clicks", value: stats.visits.toLocaleString() },
            { label: "Unique Visitors", value: stats.uniqueVisitors.toLocaleString() },
            { label: "Conversions", value: stats.conversions.toLocaleString() },
            { label: "Revenue", value: `$${(stats.revenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
            { label: "Conversion Rate", value: `${stats.conversionRate}%` },
          ].map((item) => (
            <div key={item.label} className={`${panelClass} flex flex-col gap-1 px-4 py-4`}>
              <span className="text-[22px] font-bold text-[var(--text-heading)] [font-variant-numeric:tabular-nums]">
                {item.value}
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">{item.label}</span>
            </div>
          ))}
          {affiliate.commission_rate > 0 && (
            <div className="rounded-[var(--radius)] border border-[#f97316] bg-[rgba(249,115,22,0.05)] px-4 py-4">
              <span className="text-[22px] font-bold text-[var(--text-heading)] [font-variant-numeric:tabular-nums]">
                ${ (stats.commission / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) }
              </span>
              <div className="text-[12px] text-[var(--text-muted)]">
                Commission ({(affiliate.commission_rate * 100).toFixed(0)}%)
              </div>
            </div>
          )}
        </div>

        {data.visitTimeSeries?.length ? (
          <div className={`${panelClass} mb-4`}>
            <h3 className="m-0 border-b border-[var(--border)] px-5 py-4 text-[14px] font-semibold text-[var(--text-heading)]">
              Clicks Over Time
            </h3>
            <TimeSeriesChart
              data={data.visitTimeSeries as Array<{ date: string; [key: string]: string | number }>}
              dataKey="visits"
            />
          </div>
        ) : null}

        {data.landingPages?.length ? (
          <div className={panelClass}>
            <h3 className="m-0 border-b border-[var(--border)] px-5 py-4 text-[14px] font-semibold text-[var(--text-heading)]">
              Top Landing Pages
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-[var(--border)] px-4 py-2.5 text-left text-[12px] font-medium text-[var(--text-muted)]">
                    Page
                  </th>
                  <th className="border-b border-[var(--border)] px-4 py-2.5 text-left text-[12px] font-medium text-[var(--text-muted)]">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.landingPages.map((page, index) => (
                  <tr key={index} className="hover:[&_td]:bg-[var(--bg-card-hover)]">
                    <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                      {page.name}
                    </td>
                    <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                      {page.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="pt-8 text-center text-[12px] text-[var(--text-muted)]">
          Powered by Traffic Source
        </div>
      </div>
    </div>
  );
}
