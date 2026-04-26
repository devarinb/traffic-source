"use client";

import { useEffect, useRef, useState } from "react";

import { useAppRouter } from "@/hooks/useAppRouter";
import { getCountryName } from "@/lib/formatters";
import CountryFlag from "@/components/ui/CountryFlag";
import TechIcon from "@/components/ui/TechIcon";

type RealtimeResponse = {
  count: number;
  users: Array<{
    visitor_id: string;
    country?: string | null;
    current_page?: string | null;
    source?: string | null;
    browser?: string | null;
  }>;
};

export default function RealtimeUsers() {
  const [data, setData] = useState<RealtimeResponse | null>(null);
  const [expanded, setExpanded] = useState(false);
  const router = useAppRouter();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!siteId) return;

    const fetchRealtime = async () => {
      try {
        const res = await fetch(`/api/analytics/${siteId}/realtime`);
        if (res.ok) {
          setData((await res.json()) as RealtimeResponse);
        }
      } catch {
        return;
      }
    };

    void fetchRealtime();
    intervalRef.current = setInterval(fetchRealtime, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [siteId]);

  if (!data) return null;

  return (
    <div className="fixed right-5 bottom-5 z-[200] w-[300px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--realtime-bg)] shadow-[var(--realtime-shadow)]">
      <button
        className="flex w-full items-center gap-2.5 px-4 py-3 text-[var(--text)]"
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="size-2 shrink-0 rounded-full bg-[var(--success)] animate-[pulse_2s_ease-in-out_infinite]" />
        <span className="text-[16px] font-bold [font-variant-numeric:tabular-nums]">
          {data.count}
        </span>
        <span className="flex-1 text-left text-[13px] font-medium text-[var(--text-secondary)]">
          {data.count === 1 ? "visitor" : "visitors"} online
        </span>
        <span
          className={`text-[10px] text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          &#x25B2;
        </span>
      </button>

      {expanded && data.users.length > 0 && (
        <div className="border-t border-[var(--border)]">
          {data.users.slice(0, 10).map((user) => (
            <div
              key={user.visitor_id}
              className="border-b border-[var(--border-light)] px-4 py-2.5 last:border-b-0 hover:bg-[var(--bg-card-hover)]"
            >
              <div className="flex items-center gap-2">
                <CountryFlag code={user.country} size="s" />
                <span className="text-[13px] font-medium text-[var(--text-heading)]">
                  {user.country ? getCountryName(user.country) : "Unknown"}
                </span>
                <span className="ml-auto min-w-0 shrink truncate text-[12px] text-[var(--text-muted)]">
                  {user.current_page || "/"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 pl-6">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {user.source || "Direct"}
                </span>
                <TechIcon type="browser" name={user.browser} />
              </div>
            </div>
          ))}
          {data.users.length > 10 && (
            <div className="px-4 py-2.5 text-center text-[12px] text-[var(--text-muted)]">
              +{data.users.length - 10} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
