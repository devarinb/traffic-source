"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useDateRange } from "@/contexts/DateRangeContext";
import { useAppRouter } from "@/hooks/useAppRouter";

export function useAnalytics<TData = unknown>(
  endpoint: string,
  extraParams: Record<string, string> = {},
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useAppRouter();
  const { getParams } = useDateRange();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";

  const queryString = useMemo(
    () => JSON.stringify({ ...getParams(), ...extraParams }),
    [extraParams, getParams],
  );

  const fetchData = useCallback(async () => {
    if (!siteId) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...getParams(),
        ...extraParams,
      });
      const res = await fetch(`/api/analytics/${siteId}/${endpoint}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setData((await res.json()) as TData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [endpoint, extraParams, getParams, siteId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData, queryString]);

  return { data, loading, error, refetch: fetchData };
}
