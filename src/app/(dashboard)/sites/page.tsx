"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppRouter } from "@/hooks/useAppRouter";
import { cn } from "@/lib/cn";
import {
  authErrorClass,
  buttonClass,
  emptyStateClass,
  emptyStateTitleClass,
  formGroupClass,
  inputClass,
  labelClass,
  loadingInlineClass,
  loadingSpinnerClass,
  panelClass,
  panelHeaderClass,
  pageTitleClass,
} from "@/lib/ui";

type SiteSummary = {
  id: number;
  name: string;
  domain: string;
  hourly: Array<{ hour: string; pageviews: number; visitors: number }>;
};

export default function SitesPage() {
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const router = useAppRouter();

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) {
        const data = (await res.json()) as { sites: SiteSummary[] };
        setSites(data.sites);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSites();
  }, [fetchSites]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain }),
      });
      const data = (await res.json()) as { error?: string; site: { id: number } };
      if (!res.ok) {
        throw new Error(data.error || "Failed to create site");
      }
      setShowModal(false);
      setName("");
      setDomain("");
      void fetchSites();
      router.push(`/analytics/${data.site.id}/settings`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create site");
    }
  };

  const preparedSites = [...sites]
    .map((site) => {
      const hourlyMap: Record<string, { hour: string; pageviews: number; visitors: number }> = {};
      for (const hour of site.hourly) hourlyMap[hour.hour] = hour;
      const now = new Date();
      const padded = [];
      for (let index = 23; index >= 0; index -= 1) {
        const date = new Date(now.getTime() - index * 3_600_000);
        const key = `${date.toISOString().slice(0, 13).replace("T", " ")}:00`;
        padded.push(hourlyMap[key] || { hour: key, pageviews: 0, visitors: 0 });
      }
      return {
        ...site,
        hourly: padded,
        totalPageviews: site.hourly.reduce((sum, entry) => sum + entry.pageviews, 0),
        totalVisitors: site.hourly.reduce((sum, entry) => sum + entry.visitors, 0),
      };
    })
    .sort((left, right) => right.totalPageviews - left.totalPageviews);

  return (
    <DashboardLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className={pageTitleClass}>Sites</h2>
        <button className={buttonClass("primary")} onClick={() => setShowModal(true)}>
          Add Site
        </button>
      </div>

      {loading ? (
        <div className={loadingInlineClass}>
          <div className={loadingSpinnerClass} />
        </div>
      ) : preparedSites.length === 0 ? (
        <div className={emptyStateClass}>
          <h3 className={emptyStateTitleClass}>No sites yet</h3>
          <p className="mb-4">Add your first site to start tracking analytics.</p>
          <button className={buttonClass("primary")} onClick={() => setShowModal(true)}>
            Add Site
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 max-[1280px]:grid-cols-4 max-[1024px]:grid-cols-3 max-md:grid-cols-2 max-[480px]:grid-cols-1">
          {preparedSites.map((site) => {
            const formatVisitors = (value: number) =>
              value >= 1000
                ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`
                : value.toString();

            return (
              <div
                key={site.id}
                className={cn(panelClass, "cursor-pointer transition-colors hover:border-[var(--border-focus)]")}
                onClick={() => router.push(`/analytics/${site.id}`)}
              >
                <div className="flex items-center gap-2.5 px-[14px] pt-[14px] pb-[10px]">
                  <img
                    className="size-6 shrink-0 rounded-[5px] bg-[var(--bg-surface)] object-contain"
                    src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                    alt=""
                    width={24}
                    height={24}
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[var(--text-heading)]">
                      {site.name}
                    </div>
                    <div className="mt-px truncate text-[11px] text-[var(--text-muted)]">
                      {site.domain}
                    </div>
                  </div>
                  <button
                    className="shrink-0 rounded-[4px] p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--text)]"
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/analytics/${site.id}/settings`);
                    }}
                    aria-label="Site settings"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="3" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="13" r="1.5" />
                    </svg>
                  </button>
                </div>
                <div className="relative h-16 min-h-16">
                  {site.hourly.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={site.hourly} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                        <YAxis domain={[0, "dataMax"]} hide />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke="var(--accent)"
                          fill="var(--accent)"
                          fillOpacity={0.08}
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="flex h-full items-center justify-center text-[11px] text-[var(--text-muted)]">
                      No data
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-[18px] border-t border-[var(--border-light)] px-[14px] pt-3 pb-[14px]">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[16px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--text-heading)] [font-variant-numeric:tabular-nums]">
                      {formatVisitors(site.totalVisitors)}
                    </div>
                    <div className="text-[10px] font-medium tracking-[0.05em] text-[var(--text-muted)] uppercase">
                      Visitors
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[16px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--text-heading)] [font-variant-numeric:tabular-nums]">
                      {formatVisitors(site.totalPageviews)}
                    </div>
                    <div className="text-[10px] font-medium tracking-[0.05em] text-[var(--text-muted)] uppercase">
                      Pageviews
                    </div>
                  </div>
                  <div className="ml-auto rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-[7px] py-0.5 text-[10px] font-medium tracking-[0.05em] text-[var(--text-muted)] uppercase">
                    24h
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--overlay-bg)] p-5 backdrop-blur-[4px]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-[500px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={panelHeaderClass}>
              <h2 className="text-[16px] font-semibold text-[var(--text-heading)]">Add Site</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[18px] text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                x
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="flex flex-col gap-4 p-5">
                {error && <div className={authErrorClass}>{error}</div>}
                <div className={formGroupClass}>
                  <label className={labelClass}>Site Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="My Website"
                    required
                    className={inputClass}
                  />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="example.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                <button
                  type="button"
                  className={buttonClass("secondary")}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={buttonClass("primary")}>
                  Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
