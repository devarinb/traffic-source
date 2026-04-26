"use client";

import { useCallback, useEffect, useState } from "react";

import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricStrip from "@/components/ui/MetricStrip";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useAppRouter } from "@/hooks/useAppRouter";
import {
  buttonClass,
  loadingInlineClass,
  loadingSpinnerClass,
  panelClass,
  panelHeaderClass,
  panelTabClass,
} from "@/lib/ui";

type AffiliateDetailResponse = {
  site?: { name?: string; domain?: string };
  affiliate: {
    id: number;
    name: string;
    slug: string;
    commission_rate: number;
  };
  stats: {
    visits: number;
    uniqueVisitors: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    commission: number;
  };
  visitTimeSeries?: Array<{ date: string; visits: number }>;
  landingPages?: Array<{ name: string; count: number }>;
  conversions?: Array<{
    id: number;
    created_at: string;
    stripe_customer_email?: string | null;
    visitor_id?: string | null;
    amount: number;
    utm_source?: string | null;
    referrer_domain?: string | null;
  }>;
};

export default function AffiliateDetailPage() {
  const router = useAppRouter();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";
  const affiliateId =
    typeof router.query.affiliateId === "string" ? router.query.affiliateId : "";
  const { getParams } = useDateRange();
  const [data, setData] = useState<AffiliateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!siteId || !affiliateId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(getParams());
      const response = await fetch(
        `/api/analytics/${siteId}/affiliates/${affiliateId}?${params}`,
      );
      if (response.ok) {
        setData((await response.json()) as AffiliateDetailResponse);
      }
    } finally {
      setLoading(false);
    }
  }, [affiliateId, getParams, siteId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!siteId || !affiliateId) return;
    fetch(`/api/analytics/${siteId}/affiliates/${affiliateId}/share`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const token =
          payload && typeof payload.share_token === "string"
            ? payload.share_token
            : null;
        if (token) setShareToken(token);
      })
      .catch(() => null);
  }, [affiliateId, siteId]);

  const copyReferralLink = async () => {
    if (!data) return;
    const domain = data.site?.domain || "yoursite.com";
    await navigator.clipboard.writeText(`https://${domain}?ref=${data.affiliate.slug}`);
  };

  const generateShareLink = async () => {
    setShareLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/${siteId}/affiliates/${affiliateId}/share`,
        { method: "POST" },
      );
      if (response.ok) {
        const payload = (await response.json()) as { share_token?: string };
        setShareToken(payload.share_token || null);
      }
    } finally {
      setShareLoading(false);
    }
  };

  const revokeShareLink = async () => {
    setShareLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/${siteId}/affiliates/${affiliateId}/share`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setShareToken(null);
        setShareCopied(false);
      }
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareToken || typeof window === "undefined") return;
    await navigator.clipboard.writeText(
      `${window.location.origin}/shared/affiliate/${shareToken}`,
    );
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2000);
  };

  if (loading || !data) {
    return (
      <DashboardLayout siteId={siteId}>
        <div className={loadingInlineClass}>
          <div className={loadingSpinnerClass} />
        </div>
      </DashboardLayout>
    );
  }

  const { affiliate, stats } = data;

  return (
    <DashboardLayout
      siteId={siteId}
      siteName={data.site?.name}
      siteDomain={data.site?.domain}
    >
      <div className="mb-5 flex items-center gap-3">
        <button
          className={buttonClass("secondary", "sm")}
          onClick={() => router.push(`/analytics/${siteId}/affiliates`)}
        >
          &larr; Affiliates
        </button>
        <h2 className="m-0 text-[18px] font-semibold text-[var(--text-heading)]">
          {affiliate.name}
        </h2>
        <code className="text-[12px] text-[var(--text-muted)]">
          ref={affiliate.slug}
        </code>
      </div>

      <MetricStrip
        metrics={[
          { label: "Visits", value: stats.visits },
          { label: "Unique Visitors", value: stats.uniqueVisitors },
          { label: "Conversions", value: stats.conversions },
          { label: "Revenue", value: stats.revenue, format: "currency" },
          {
            label: "Conversion Rate",
            value: stats.conversionRate,
            format: "percent",
          },
          ...(affiliate.commission_rate > 0
            ? [
                {
                  label: `Commission (${(affiliate.commission_rate * 100).toFixed(0)}%)`,
                  value: stats.commission,
                  format: "currency" as const,
                },
              ]
            : []),
        ]}
      />

      <div className={`${panelClass} mb-5`}>
        <div className={panelHeaderClass}>
          <div className="flex items-center">
            <button className={panelTabClass(true)}>Referral Link</button>
          </div>
        </div>
        <div className="flex items-center gap-3 p-5 max-md:flex-col max-md:items-stretch">
          <code className="flex-1 overflow-hidden rounded-[var(--radius)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] text-ellipsis whitespace-nowrap">
            https://{data.site?.domain}?ref={affiliate.slug}
          </code>
          <button
            className={buttonClass("primary", "sm")}
            onClick={() => void copyReferralLink()}
          >
            Copy
          </button>
        </div>
      </div>

      <div className={`${panelClass} mb-5`}>
        <div className={panelHeaderClass}>
          <div className="flex items-center">
            <button className={panelTabClass(true)}>Partner Dashboard Link</button>
          </div>
        </div>
        <div className="p-5">
          {shareToken ? (
            <div className="flex flex-col gap-3">
              <p className="m-0 text-[13px] text-[var(--text-secondary)]">
                Share this link with your affiliate partner so they can view their
                performance.
              </p>
              <div className="flex items-center gap-3 max-md:flex-col max-md:items-stretch">
                <code className="flex-1 overflow-hidden rounded-[var(--radius)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] text-ellipsis whitespace-nowrap">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/shared/affiliate/${shareToken}`
                    : ""}
                </code>
                <button
                  className={buttonClass("primary", "sm")}
                  onClick={() => void copyShareLink()}
                >
                  {shareCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  className={buttonClass("secondary", "sm")}
                  onClick={() => void revokeShareLink()}
                  disabled={shareLoading}
                  style={{ color: "var(--danger)" }}
                >
                  Revoke
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
              <p className="m-0 text-[13px] text-[var(--text-secondary)]">
                Generate a public link so your partner can see their clicks,
                conversions, and commission.
              </p>
              <button
                className={buttonClass("primary", "sm")}
                onClick={() => void generateShareLink()}
                disabled={shareLoading}
              >
                {shareLoading ? "Generating..." : "Generate Link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {(data.visitTimeSeries || []).length ? (
        <div className={`${panelClass} mb-5`}>
          <div className={panelHeaderClass}>
            <div className="flex items-center">
              <button className={panelTabClass(true)}>Visits Over Time</button>
            </div>
          </div>
          <div className="p-5">
            <TimeSeriesChart
              data={data.visitTimeSeries || []}
              dataKey="visits"
              label="Visits"
            />
          </div>
        </div>
      ) : null}

      {(data.landingPages || []).length ? (
        <div className={`${panelClass} mb-5`}>
          <div className={panelHeaderClass}>
            <div className="flex items-center">
              <button className={panelTabClass(true)}>Top Landing Pages</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Page", "Visits"].map((label) => (
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
                {(data.landingPages || []).map((page, index) => (
                  <tr key={index}>
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
        </div>
      ) : null}

      {(data.conversions || []).length ? (
        <div className={`${panelClass} mb-5`}>
          <div className={panelHeaderClass}>
            <div className="flex items-center">
              <button className={panelTabClass(true)}>Conversions</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Date", "Email", "Amount", "Source"].map((label) => (
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
                {(data.conversions || []).map((conversion) => (
                  <tr key={conversion.id}>
                    <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                      {new Date(conversion.created_at).toLocaleDateString()}
                    </td>
                    <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                      {conversion.stripe_customer_email ||
                        conversion.visitor_id?.slice(0, 8)}
                    </td>
                    <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                      ${(conversion.amount / 100).toFixed(2)}
                    </td>
                    <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                      {conversion.utm_source || conversion.referrer_domain || "Direct"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
