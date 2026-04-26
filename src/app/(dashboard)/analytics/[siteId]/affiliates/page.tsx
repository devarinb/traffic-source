"use client";

import { useState, type FormEvent } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  authErrorClass,
  buttonClass,
  formGroupClass,
  inputClass,
  labelClass,
  loadingInlineClass,
  loadingSpinnerClass,
  panelClass,
  panelHeaderClass,
  panelTabClass,
} from "@/lib/ui";

type AffiliateRow = {
  id: number;
  name: string;
  slug: string;
  visits: number;
  unique_visitors: number;
  conversions: number;
  revenue: number;
};

type AffiliatesResponse = {
  site?: { name?: string; domain?: string };
  affiliates?: AffiliateRow[];
};

export default function AffiliatesPage() {
  const router = useAppRouter();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";
  const { data, loading, refetch } = useAnalytics<AffiliatesResponse>("affiliates");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    commission_rate: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await fetch(`/api/sites/${siteId}/affiliates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          commission_rate: form.commission_rate
            ? Number.parseFloat(form.commission_rate) / 100
            : 0,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Failed to create affiliate");
      setForm({ name: "", slug: "", commission_rate: "" });
      setShowCreate(false);
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create affiliate");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (affiliateId: number) => {
    if (!confirm("Delete this affiliate and all its tracking data?")) return;
    await fetch(`/api/sites/${siteId}/affiliates/${affiliateId}`, { method: "DELETE" });
    void refetch();
  };

  const copyLink = async (slug: string) => {
    const domain = data?.site?.domain || "yoursite.com";
    await navigator.clipboard.writeText(`https://${domain}?ref=${slug}`);
  };

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
            <button className={panelTabClass(true)}>Affiliates</button>
          </div>
          <button
            className={buttonClass("primary", "sm")}
            onClick={() => setShowCreate((current) => !current)}
          >
            {showCreate ? "Cancel" : "+ Add Affiliate"}
          </button>
        </div>

        {showCreate ? (
          <div className="border-b border-[var(--border)] p-5">
            {error ? <div className={`${authErrorClass} mb-4`}>{error}</div> : null}
            <form className="flex flex-wrap items-end gap-3" onSubmit={handleCreate}>
              <div className={`${formGroupClass} min-w-[150px] flex-1`}>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  className={inputClass}
                />
              </div>
              <div className={`${formGroupClass} min-w-[150px] flex-1`}>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  placeholder="john-doe"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  required
                  className={inputClass}
                />
              </div>
              <div className={`${formGroupClass} min-w-[120px]`}>
                <label className={labelClass}>Commission %</label>
                <input
                  type="number"
                  placeholder="20"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.commission_rate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      commission_rate: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className={buttonClass("primary", "sm")}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        ) : null}

        <div>
          {loading ? (
            <div className={loadingInlineClass}>
              <div className={loadingSpinnerClass} />
            </div>
          ) : !(data?.affiliates || []).length ? (
            <div className="px-10 py-10 text-center text-[13px] text-[var(--text-muted)]">
              No affiliates yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {[
                      "Affiliate",
                      "Slug",
                      "Visits",
                      "Visitors",
                      "Conversions",
                      "Revenue",
                      "Conv. Rate",
                      "",
                    ].map((label) => (
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
                  {(data?.affiliates || []).map((affiliate) => {
                    const rate =
                      affiliate.unique_visitors > 0
                        ? ((affiliate.conversions / affiliate.unique_visitors) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={affiliate.id}
                        className="cursor-pointer hover:[&_td]:bg-[var(--bg-card-hover)]"
                        onClick={() =>
                          router.push(`/analytics/${siteId}/affiliates/${affiliate.id}`)
                        }
                      >
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                          {affiliate.name}
                        </td>
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                          <code className="text-[12px] text-[var(--text-secondary)]">
                            {affiliate.slug}
                          </code>
                        </td>
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                          {affiliate.visits.toLocaleString()}
                        </td>
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                          {affiliate.unique_visitors.toLocaleString()}
                        </td>
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                          {affiliate.conversions}
                        </td>
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px] font-semibold">
                          ${(affiliate.revenue / 100).toFixed(2)}
                        </td>
                        <td className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]">
                          {rate}%
                        </td>
                        <td
                          className="border-b border-[var(--border-light)] px-4 py-3 text-[13px]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex gap-1">
                            <button
                              className={buttonClass("secondary", "sm")}
                              onClick={() => void copyLink(affiliate.slug)}
                              title="Copy referral link"
                            >
                              Copy Link
                            </button>
                            <button
                              className={buttonClass("ghost", "sm")}
                              onClick={() => void handleDelete(affiliate.id)}
                              title="Delete affiliate"
                              style={{ color: "var(--danger)" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
