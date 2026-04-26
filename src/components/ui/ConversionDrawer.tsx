"use client";

import { useEffect, useState } from "react";

import CountryFlag from "@/components/ui/CountryFlag";
import TechIcon from "@/components/ui/TechIcon";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { getCountryName } from "@/lib/formatters";
import { emptyStateClass, loadingInlineClass, loadingSpinnerClass } from "@/lib/ui";

type Conversion = {
  id: number;
  visitor_id?: string | null;
  stripe_customer_email?: string | null;
};

type JourneyData = {
  timeToComplete: number;
  visitor: { totalSessions: number; totalPageViews: number };
  conversion?: { amount?: number; created_at?: string; stripe_customer_email?: string | null };
  sessions: Array<{
    id: string;
    started_at: string;
    country?: string | null;
    browser?: string | null;
    referrer_domain?: string | null;
    utm_source?: string | null;
    duration: number;
    page_count: number;
    pageViews: Array<{ id?: number; pathname: string; timestamp: string }>;
  }>;
};

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "Instant";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function formatSessionDuration(seconds: number) {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function formatTimestamp(isoString?: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

export default function ConversionDrawer({
  siteId,
  conversion,
  onClose,
}: {
  siteId?: string;
  conversion: Conversion | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversion || !siteId) {
      setData(null);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      visitorId: conversion.visitor_id || "",
      conversionId: String(conversion.id),
    });
    fetch(`/api/analytics/${siteId}/visitor-journey?${params}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setData(payload as JourneyData | null))
      .finally(() => setLoading(false));
  }, [conversion, siteId]);

  useEffect(() => {
    if (!conversion) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [conversion, onClose]);

  if (!conversion) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[999] bg-[var(--overlay-light)] opacity-100 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-[1001] flex w-[520px] max-w-[90vw] translate-x-0 flex-col border-l border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] max-[600px]:max-w-[100vw] max-[600px]:w-screen">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <VisitorAvatar visitorId={conversion.visitor_id} size={36} />
            <div>
              <div className="text-[15px] font-semibold text-[var(--text-heading)]">
                Conversion Journey
              </div>
              <div className="mt-px text-[12px] text-[var(--text-muted)]">
                {conversion.stripe_customer_email
                  ? `${conversion.stripe_customer_email.split("@")[0].slice(0, 3)}***`
                  : `Visitor ${(conversion.visitor_id || "").slice(-6)}`}
              </div>
            </div>
          </div>
          <button
            className="rounded-[var(--radius-xs)] px-2 py-1 text-[22px] text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className={loadingInlineClass}>
              <div className={loadingSpinnerClass} />
            </div>
          ) : data ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-2.5">
                <SummaryItem label="Time to convert" value={formatDuration(data.timeToComplete)} />
                <SummaryItem label="Sessions" value={String(data.visitor.totalSessions)} />
                <SummaryItem label="Pages viewed" value={String(data.visitor.totalPageViews)} />
                <SummaryItem
                  label="Amount"
                  value={`$${((data.conversion?.amount || 0) / 100).toLocaleString()}`}
                />
              </div>

              <div className="flex flex-col">
                {data.sessions.map((session, index) => (
                  <div key={session.id} className="flex gap-[14px]">
                    <div className="flex w-4 shrink-0 flex-col items-center pt-1">
                      <div className="z-[1] size-2.5 shrink-0 rounded-full border-2 border-[var(--bg-card)] bg-[var(--text-muted)] shadow-[0_0_0_2px_var(--border)]" />
                      {(index < data.sessions.length - 1 || data.conversion) && (
                        <div className="my-1 w-0.5 flex-1 bg-[var(--border)]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pb-5">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[var(--text)]">
                          Session {index + 1}
                        </span>
                        <span className="text-[11px] whitespace-nowrap text-[var(--text-muted)]">
                          {formatTimestamp(session.started_at)}
                        </span>
                      </div>

                      <div className="mb-2 flex flex-wrap gap-2.5 text-[12px] text-[var(--text-secondary)]">
                        {session.country && (
                          <span className="inline-flex items-center gap-1">
                            <CountryFlag code={session.country} size="s" />
                            {getCountryName(session.country)}
                          </span>
                        )}
                        {session.browser && (
                          <span className="inline-flex items-center gap-1">
                            <TechIcon type="browser" name={session.browser} />
                            {session.browser}
                          </span>
                        )}
                        {session.referrer_domain && <span>via {session.referrer_domain}</span>}
                        {session.utm_source && <span>utm: {session.utm_source}</span>}
                        <span>
                          {formatSessionDuration(session.duration)} · {session.page_count} page
                          {session.page_count !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {session.pageViews.length > 0 && (
                        <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--bg-surface)]">
                          {session.pageViews.map((pageView, pageIndex) => (
                            <div
                              key={pageView.id || pageIndex}
                              className="flex items-center justify-between border-b border-[var(--border-light)] px-2.5 py-1.5 text-[12px] last:border-b-0"
                            >
                              <span className="mr-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-[var(--text)]">
                                {pageView.pathname}
                              </span>
                              <span className="text-[11px] whitespace-nowrap text-[var(--text-muted)]">
                                {new Date(pageView.timestamp).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {data.conversion && (
                  <div className="flex gap-[14px]">
                    <div className="flex w-4 shrink-0 flex-col items-center pt-1">
                      <div className="z-[1] size-2.5 shrink-0 rounded-full border-2 border-[var(--bg-card)] bg-[var(--success)] shadow-[0_0_0_2px_rgba(34,197,94,0.3)]" />
                    </div>
                    <div className="min-w-0 flex-1 pb-5">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[var(--success)]">
                          Payment completed
                        </span>
                        <span className="text-[11px] whitespace-nowrap text-[var(--text-muted)]">
                          {formatTimestamp(data.conversion.created_at)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5 text-[12px] text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--success)]">
                          ${((data.conversion.amount || 0) / 100).toLocaleString()}
                        </span>
                        {data.conversion.stripe_customer_email && (
                          <span>{data.conversion.stripe_customer_email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={emptyStateClass}>
              <p>Could not load journey data</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--bg-surface)] px-[14px] py-3">
      <span className="text-[11px] font-medium tracking-[0.3px] text-[var(--text-muted)] uppercase">
        {label}
      </span>
      <span className="text-[18px] font-bold text-[var(--text-heading)] [font-variant-numeric:tabular-nums]">
        {value}
      </span>
    </div>
  );
}
