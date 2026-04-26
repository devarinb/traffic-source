"use client";

import { useCallback, useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ConversionJourneyTable from "@/components/ui/ConversionJourneyTable";
import FlowView from "@/components/ui/FlowView";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useAppRouter } from "@/hooks/useAppRouter";
import {
  buttonClass,
  inputClass,
  loadingInlineClass,
  loadingSpinnerClass,
  panelClass,
  panelHeaderClass,
  panelTabClass,
} from "@/lib/ui";

type ConversionsResponse = {
  site?: { name?: string; domain?: string };
  conversions?: ConversionRow[];
  pagination?: {
    page: number;
    totalPages: number;
  };
};

type ConversionRow = {
  id: number;
  visitor_id?: string | null;
  stripe_customer_email?: string | null;
  device_type?: string | null;
  country?: string | null;
  browser?: string | null;
  utm_source?: string | null;
  referrer_domain?: string | null;
  amount: number;
  currency?: string | null;
  timeToComplete: number;
  created_at: string;
  journey?: Array<{ pathname: string }>;
};

export default function ConversionsPage() {
  const router = useAppRouter();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";
  const { getParams } = useDateRange();
  const [data, setData] = useState<ConversionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"journey" | "funnel">("journey");

  const fetchData = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...getParams(),
        page: String(page),
        limit: "25",
        ...(search ? { search } : {}),
      });
      const response = await fetch(`/api/analytics/${siteId}/conversions?${params}`);
      if (response.ok) {
        setData((await response.json()) as ConversionsResponse);
      }
    } finally {
      setLoading(false);
    }
  }, [getParams, page, search, siteId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  return (
    <DashboardLayout
      siteId={siteId}
      siteName={data?.site?.name}
      siteDomain={data?.site?.domain}
    >
      <div className="mb-5">
        <button
          className={buttonClass("secondary", "sm")}
          onClick={() => router.push(`/analytics/${siteId}`)}
        >
          &larr; Dashboard
        </button>
      </div>

      <div className={`${panelClass} mb-5`}>
        <div className={panelHeaderClass}>
          <div className="flex items-center">
            <button
              className={panelTabClass(activeTab === "journey")}
              onClick={() => setActiveTab("journey")}
            >
              Journey for payment
            </button>
            <button
              className={panelTabClass(activeTab === "funnel")}
              onClick={() => setActiveTab("funnel")}
            >
              Funnel
            </button>
          </div>

          {activeTab === "journey" ? (
            <div className="w-full max-w-[220px] py-2">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className={`${inputClass} h-9 py-2 text-[13px]`}
              />
            </div>
          ) : null}
        </div>

        <div>
          {activeTab === "journey" ? (
            loading ? (
              <div className={loadingInlineClass}>
                <div className={loadingSpinnerClass} />
              </div>
            ) : (
              <ConversionJourneyTable
                conversions={data?.conversions || []}
                siteId={siteId}
              />
            )
          ) : (
            <FlowView siteId={siteId} />
          )}
        </div>

        {activeTab === "journey" &&
        data?.pagination &&
        data.pagination.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4 text-[13px]">
            <button
              className={buttonClass("secondary", "sm")}
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span className="text-[var(--text-muted)]">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              className={buttonClass("secondary", "sm")}
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
