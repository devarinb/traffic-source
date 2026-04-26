"use client";

import { useState } from "react";

import ConversionDrawer from "@/components/ui/ConversionDrawer";
import CountryFlag from "@/components/ui/CountryFlag";
import TechIcon from "@/components/ui/TechIcon";
import VisitorAvatar from "@/components/ui/VisitorAvatar";
import { getCountryName, getDeviceIcon } from "@/lib/formatters";
import { emptyStateClass } from "@/lib/ui";

const JOURNEY_COLORS = [
  "#7c5bf5",
  "#4c9fe8",
  "#22c55e",
  "#f5875b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

type Conversion = {
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

function getJourneyColor(pathname: string) {
  let hash = 0;
  for (let index = 0; index < pathname.length; index += 1) {
    hash = (hash << 5) - hash + pathname.charCodeAt(index);
    hash |= 0;
  }
  return JOURNEY_COLORS[Math.abs(hash) % JOURNEY_COLORS.length];
}

function formatTimeToComplete(seconds: number) {
  if (!seconds || seconds <= 0) return "Instant";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  return `${Math.floor(seconds / 86400)} days`;
}

function formatAmount(amount: number, currency?: string | null) {
  const value = (amount || 0) / 100;
  if (currency === "usd" || !currency) {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `${value.toFixed(2)} ${currency.toUpperCase()}`;
}

function getSourceFavicon(domain?: string | null) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`;
}

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
}

function maskName(email?: string | null) {
  if (!email) return null;
  const [local] = email.split("@");
  if (local.length <= 3) return `${local.slice(0, 1)}** ******`;
  return `${local.slice(0, 3)}** ******`;
}

export default function ConversionJourneyTable({
  conversions,
  siteId,
}: {
  conversions: Conversion[];
  siteId?: string;
}) {
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);

  if (!conversions.length) {
    return (
      <div className={emptyStateClass}>
        <p>No conversions for this period</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Visitor", "Country", "Browser", "Source", "Spent", "Time to complete", "Completed at", ""].map((label) => (
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
          {conversions.map((conversion) => {
            const source = conversion.utm_source || conversion.referrer_domain || "Direct";
            const displayName =
              maskName(conversion.stripe_customer_email) ||
              `Visitor ${(conversion.visitor_id || "").slice(-6)}`;

            return (
              <tr
                key={conversion.id}
                className="cursor-pointer hover:[&_td]:bg-[var(--bg-card-hover)]"
                onClick={() => setSelectedConversion(conversion)}
              >
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  <div className="flex items-center gap-3">
                    <VisitorAvatar visitorId={conversion.visitor_id} size={44} />
                    <div className="flex flex-col gap-0.5">
                      <div className="text-[13px] font-semibold">
                        {displayName}
                        <span className="ml-1.5 inline-block rounded-[4px] bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-bold uppercase">
                          Customer
                        </span>
                      </div>
                      {conversion.device_type && (
                        <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
                          <span>
                            {getDeviceIcon(conversion.device_type)} {conversion.device_type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {conversion.country ? (
                      <>
                        <CountryFlag code={conversion.country} size="s" />
                        <span>{getCountryName(conversion.country)}</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">--</span>
                    )}
                  </div>
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {conversion.browser ? (
                      <>
                        <TechIcon type="browser" name={conversion.browser} />
                        <span>{conversion.browser}</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">--</span>
                    )}
                  </div>
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  <div className="flex items-center gap-2 font-medium">
                    {conversion.referrer_domain && (
                      <img
                        src={getSourceFavicon(conversion.referrer_domain) || ""}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 rounded-[2px]"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span>{source}</span>
                  </div>
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-bold text-[var(--text-heading)]">
                  {formatAmount(conversion.amount, conversion.currency)}
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  {formatTimeToComplete(conversion.timeToComplete)}
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  {formatTimestamp(conversion.created_at)}
                </td>
                <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                  <div className="flex flex-wrap items-center gap-1">
                    {(conversion.journey || []).map((step, index) => (
                      <div
                        key={index}
                        className="size-2.5 shrink-0 rounded-full transition-transform hover:scale-140"
                        style={{ backgroundColor: getJourneyColor(step.pathname) }}
                        title={step.pathname}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConversionDrawer
        siteId={siteId}
        conversion={selectedConversion}
        onClose={() => setSelectedConversion(null)}
      />
    </div>
  );
}
