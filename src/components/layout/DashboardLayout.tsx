"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppRouter } from "@/hooks/useAppRouter";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/lib/ui";

const periods = [
  { value: "24h", label: "1D" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "1M" },
  { value: "90d", label: "3M" },
  { value: "12m", label: "1Y" },
];

type DashboardLayoutProps = {
  children: ReactNode;
  siteId?: string;
  siteName?: string | null;
  siteDomain?: string | null;
};

function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="m6.28 13.22l3.6-2.4a.17.17 0 0 0 .06-.12a.15.15 0 0 0-.06-.11L6.62 8.42a1.2 1.2 0 0 0-1.24 0l-3.26 2.17a.15.15 0 0 0-.06.11a.17.17 0 0 0 .06.12l3.6 2.4a.52.52 0 0 0 .56 0"
      />
      <path
        fill="currentColor"
        d="M1.54 11.68a.1.1 0 0 0 0 .07v8.62a1.6 1.6 0 0 0 .62 1.17l3.26 2.29a1.2 1.2 0 0 0 1.24 0l3.26-2.29a1.6 1.6 0 0 0 .62-1.17v-8.62a.1.1 0 0 0 0-.07a.08.08 0 0 0-.08 0l-3.63 2.37a1.5 1.5 0 0 1-1.66 0l-3.55-2.36a.08.08 0 0 0-.08-.01m12-8.25a.1.1 0 0 0 0 .07v16.87a1.6 1.6 0 0 0 .62 1.17l3.26 2.29a1.2 1.2 0 0 0 1.24 0l3.26-2.29a1.6 1.6 0 0 0 .62-1.17V3.5a.1.1 0 0 0 0-.07a.08.08 0 0 0-.08 0L18.83 5.8a1.5 1.5 0 0 1-1.66 0l-3.55-2.36a.08.08 0 0 0-.08-.01"
      />
      <path
        fill="currentColor"
        d="m18.28 5l3.6-2.4a.17.17 0 0 0 .06-.12a.15.15 0 0 0-.06-.11L18.62.17a1.2 1.2 0 0 0-1.24 0l-3.26 2.17a.15.15 0 0 0-.06.11a.17.17 0 0 0 .06.12L17.72 5a.52.52 0 0 0 .56 0"
      />
    </svg>
  );
}

export default function DashboardLayout({
  children,
  siteId,
  siteName,
  siteDomain,
}: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { period, setPeriod, setCustomRange } = useDateRange();
  const { theme, toggleTheme } = useTheme();
  const router = useAppRouter();
  const path = router.asPath;

  const navLinkClass = (active: boolean) =>
    cn(
      "rounded-[var(--radius-sm)] px-3 py-1.5 text-[13px] font-medium transition-colors",
      active
        ? "text-[var(--text)]"
        : "text-[var(--text-muted)] hover:text-[var(--text)]",
    );

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <header className="sticky top-0 z-[100] flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--header-bg)] px-6 backdrop-blur-[12px] max-md:px-4">
          <div className="flex items-center gap-8 max-md:gap-4">
            <Link
              href="/sites"
              className="inline-flex shrink-0 items-center gap-2 text-[15px] font-bold tracking-[-0.3px] text-[var(--text-heading)]"
            >
              <LogoMark />
              Traffic Source
            </Link>
            <nav className="flex items-center gap-1 max-md:hidden">
              <Link href="/sites" className={navLinkClass(path === "/sites")}>
                Sites
              </Link>
              {siteId && (
                <>
                  <Link
                    href={`/analytics/${siteId}`}
                    className={navLinkClass(path === `/analytics/${siteId}`)}
                  >
                    Analytics
                  </Link>
                  <Link
                    href={`/analytics/${siteId}/conversions`}
                    className={navLinkClass(path.includes("/conversions"))}
                  >
                    Conversions
                  </Link>
                  <Link
                    href={`/analytics/${siteId}/affiliates`}
                    className={navLinkClass(path.includes("/affiliates"))}
                  >
                    Affiliates
                  </Link>
                  <Link
                    href={`/analytics/${siteId}/gsc`}
                    className={navLinkClass(path.includes("/gsc"))}
                  >
                    Search Console
                  </Link>
                  <Link
                    href={`/analytics/${siteId}/settings`}
                    className={navLinkClass(
                      path.includes("/analytics/") && path.includes("/settings"),
                    )}
                  >
                    Settings
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className={cn(navLinkClass(path === "/settings"), "inline-flex items-center gap-1.5")}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Settings
            </Link>
            <button
              className={buttonClass("ghost", "sm")}
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button className={buttonClass("ghost", "sm")} onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-7 py-6 max-md:px-4">
          {(siteName || siteDomain) && (
            <div className="mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
              <div className="flex items-center gap-3">
                {siteDomain && (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(siteDomain)}&sz=32`}
                    alt=""
                    width={24}
                    height={24}
                    className="shrink-0 rounded-[4px]"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <h1 className="m-0 text-[18px] leading-[1.2] font-bold text-[var(--text-heading)]">
                    {siteName || siteDomain}
                  </h1>
                  {siteName && siteDomain && (
                    <span className="text-[12px] text-[var(--text-muted)]">
                      {siteDomain}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-[3px]">
                {periods.map((item) => (
                  <button
                    key={item.value}
                    className={cn(
                      "rounded-[var(--radius-xs)] px-[14px] py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors",
                      item.value === period
                        ? "bg-[var(--text)] text-[var(--btn-primary-text)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]",
                    )}
                    onClick={() => {
                      setCustomRange(null);
                      setPeriod(item.value);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
