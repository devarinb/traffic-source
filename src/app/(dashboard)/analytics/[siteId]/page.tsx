"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import CombinedChart from "@/components/charts/CombinedChart";
import AnalyticsPanel from "@/components/ui/AnalyticsPanel";
import ChannelIcon from "@/components/ui/ChannelIcon";
import CountryFlag from "@/components/ui/CountryFlag";
import MetricStrip from "@/components/ui/MetricStrip";
import RealtimeUsers from "@/components/ui/RealtimeUsers";
import TechIcon from "@/components/ui/TechIcon";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useAnalytics } from "@/hooks/useAnalytics";
import { buildPageHref, getCountryName } from "@/lib/formatters";
import { buttonClass, loadingInlineClass, loadingSpinnerClass, panelClass } from "@/lib/ui";

type OverviewData = {
  site?: { name?: string; domain?: string; id?: number };
  current: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    avgDuration: number;
  };
  changes: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    avgDuration: number;
  };
  conversions?: {
    totals?: { revenue?: number; conversionRate?: number };
    timeSeries?: Array<Record<string, string | number>>;
    bySource?: Array<{ name: string; conversions: number; revenue: number }>;
  };
  timeSeries?: Array<Record<string, string | number>>;
  sources?: Array<{ name: string; sessions: number }>;
  countries?: Array<{ name: string; count: number }>;
  cities?: Array<{ name: string; count: number }>;
  pages?: Array<{ name: string; views: number }>;
  entryPages?: Array<{ name: string; sessions: number }>;
  exitPages?: Array<{ name: string; sessions: number }>;
  browsers?: Array<{ name: string; count: number }>;
  os?: Array<{ name: string; count: number }>;
  devices?: Array<{ name: string; count: number }>;
  affiliates?: Array<{ name: string; visits: number; conversions: number; revenue: number }>;
};

export default function AnalyticsOverviewPage() {
  const router = useAppRouter();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";
  const { data, loading } = useAnalytics<OverviewData>("overview");

  if (loading || !data) {
    return (
      <DashboardLayout siteId={siteId}>
        <div className={loadingInlineClass}>
          <div className={loadingSpinnerClass} />
        </div>
      </DashboardLayout>
    );
  }

  const conversions = data.conversions?.totals || {};

  return (
    <DashboardLayout
      siteId={siteId}
      siteName={data.site?.name}
      siteDomain={data.site?.domain}
    >
      <RealtimeUsers />

      <MetricStrip
        metrics={[
          { label: "Visitors", value: data.current.visitors, change: data.changes.visitors },
          { label: "Pageviews", value: data.current.pageViews, change: data.changes.pageViews },
          { label: "Revenue", value: conversions.revenue || 0, format: "currency" },
          { label: "Conversion rate", value: conversions.conversionRate || 0, format: "percent" },
          { label: "Bounce rate", value: data.current.bounceRate, change: data.changes.bounceRate, format: "percent" },
          { label: "Session time", value: data.current.avgDuration, change: data.changes.avgDuration, format: "duration" },
        ]}
      />

      <div className={`${panelClass} mb-5`}>
        <CombinedChart
          trafficData={data.timeSeries}
          revenueData={data.conversions?.timeSeries}
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        <AnalyticsPanel
          tabs={[
            { key: "referrer", label: "Channel" },
            { key: "utm_source", label: "Referrer" },
            { key: "utm_campaign", label: "Campaign" },
          ]}
          data={{
            referrer: data.sources || [],
            utm_source: (data.sources || []).filter((item) => item.name !== "Direct"),
            utm_campaign: (data.sources || []).filter((item) => item.name !== "Direct"),
          }}
          valueKey="sessions"
          renderLabel={(row) => (
            <span className="inline-flex items-center gap-2">
              <ChannelIcon name={String(row.name || "")} />
              {String(row.name || "")}
            </span>
          )}
          showPercentage
          defaultTab="referrer"
        />

        <AnalyticsPanel
          tabs={[
            { key: "country", label: "Country" },
            { key: "city", label: "City" },
          ]}
          data={{
            country: data.countries || [],
            city: data.cities || [],
          }}
          renderLabel={(row, meta) => {
            if (meta.activeTab === "city") return String(row.name || "");
            return (
              <span className="inline-flex items-center gap-2">
                <CountryFlag code={String(row.name || "")} size="s" />
                {getCountryName(String(row.name || ""))}
              </span>
            );
          }}
          showPercentage
          defaultTab="country"
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        <AnalyticsPanel
          tabs={[
            { key: "all", label: "Page" },
            { key: "entry", label: "Entry page" },
            { key: "exit", label: "Exit page" },
          ]}
          data={{
            all: (data.pages || []).map((page) => ({ ...page, count: page.views })),
            entry: (data.entryPages || []).map((page) => ({ ...page, count: page.sessions })),
            exit: (data.exitPages || []).map((page) => ({ ...page, count: page.sessions })),
          }}
          renderLabel={(row) => renderPageLabel(String(row.name || ""), data.site?.domain)}
          showPercentage
          barByTotal
          defaultTab="all"
        />

        <AnalyticsPanel
          tabs={[
            { key: "browser", label: "Browser" },
            { key: "os", label: "OS" },
            { key: "device", label: "Device" },
          ]}
          data={{
            browser: data.browsers || [],
            os: data.os || [],
            device: data.devices || [],
          }}
          renderLabel={(row, meta) => (
            <span className="inline-flex items-center gap-2">
              <TechIcon
                type={meta.activeTab as "browser" | "os" | "device"}
                name={String(row.name || "")}
              />
              {String(row.name || "")}
            </span>
          )}
          showPercentage
          defaultTab="browser"
        />
      </div>

      {data.affiliates?.length ? (
        <div className={`${panelClass} mb-5`}>
          <div className="flex min-h-11 items-center justify-between border-b border-[var(--border)] px-4">
            <button className="mb-[-1px] border-b-2 border-[var(--text)] px-[14px] py-3 text-[13px] font-semibold text-[var(--text)]">
              Affiliates
            </button>
            <button
              className={buttonClass("secondary", "sm")}
              onClick={() => router.push(`/analytics/${siteId}/affiliates`)}
            >
              View all &rarr;
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Affiliate", "Visits", "Conversions", "Revenue"].map((label) => (
                  <th
                    key={label}
                    className="border-b border-[var(--border)] px-4 py-2.5 text-left text-[12px] font-medium text-[var(--text-muted)]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.affiliates.map((affiliate, index) => (
                <tr key={index} className="hover:[&_td]:bg-[var(--bg-card-hover)]">
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                    {affiliate.name}
                  </td>
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                    {affiliate.visits}
                  </td>
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                    {affiliate.conversions}
                  </td>
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                    ${((affiliate.revenue || 0) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data.conversions?.bySource?.length ? (
        <div className={panelClass}>
          <div className="flex min-h-11 items-center justify-between border-b border-[var(--border)] px-4">
            <button className="mb-[-1px] border-b-2 border-[var(--text)] px-[14px] py-3 text-[13px] font-semibold text-[var(--text)]">
              Journey for payment
            </button>
            <button
              className={buttonClass("secondary", "sm")}
              onClick={() => router.push(`/analytics/${siteId}/conversions`)}
            >
              View all &rarr;
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Source", "Conversions", "Revenue"].map((label) => (
                  <th
                    key={label}
                    className="border-b border-[var(--border)] px-4 py-2.5 text-left text-[12px] font-medium text-[var(--text-muted)]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.conversions.bySource.map((row, index) => (
                <tr key={index} className="hover:[&_td]:bg-[var(--bg-card-hover)]">
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                    {row.name}
                  </td>
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                    {row.conversions}
                  </td>
                  <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                    ${((row.revenue || 0) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

function renderPageLabel(pathname: string, siteDomain?: string) {
  const href = buildPageHref(pathname, siteDomain);
  if (!href) return pathname || "/";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 font-medium text-[var(--text)] hover:text-[var(--text-secondary)]"
    >
      <span className="truncate">{pathname || "/"}</span>
      <span aria-hidden="true">&uarr;</span>
    </a>
  );
}
