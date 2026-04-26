"use client";

import { useMemo, useEffect, useState, type FormEvent } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppRouter } from "@/hooks/useAppRouter";
import {
  authErrorClass,
  buttonClass,
  codeBlockClass,
  codeCopyButtonClass,
  formGroupClass,
  inputClass,
  labelClass,
  loadingInlineClass,
  loadingSpinnerClass,
  panelClass,
  panelHeaderClass,
  panelTabClass,
  pageTitleClass,
} from "@/lib/ui";

type SiteState = {
  id: number;
  name: string;
  domain: string;
  stripe_secret_key?: string | null;
};

type SnippetState = {
  trackingSnippet: string;
  stripeSnippet: string;
};

function highlightCode(code: string, highlightPatterns: string[] = []) {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const tokenPattern =
    /('(?:[^'\\]|\\.)*')|("(?:[^"\\]|\\.)*")|(\b(?:const|let|var|await|async|function|return|if|else|import|from|export|default|new)\b)|(&lt;\/?[\w-]+)|(\b(?:true|false|null|undefined)\b)/g;

  return html
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      const isHighlighted = highlightPatterns.some((pattern) => trimmed.includes(pattern));

      let tokenized: string;
      if (trimmed.startsWith("//") || trimmed.startsWith("&lt;!--")) {
        tokenized = `<span class="text-[var(--hl-comment)]">${line}</span>`;
      } else {
        tokenized = line.replace(tokenPattern, (match, sq, dq, kw, tag, lit) => {
          if (sq || dq) return `<span class="text-[var(--hl-string)]">${match}</span>`;
          if (kw) return `<span class="text-[var(--hl-keyword)]">${match}</span>`;
          if (tag) return `<span class="text-[var(--hl-tag)]">${match}</span>`;
          if (lit) return `<span class="text-[var(--hl-literal)]">${match}</span>`;
          return match;
        });
      }

      if (isHighlighted) {
        return `<span class="mx-[-12px] block border-l-2 border-[var(--hl-line-border)] bg-[var(--hl-line-bg)] px-3">${tokenized}</span>`;
      }

      return tokenized;
    })
    .join("\n");
}

function CodeBlock({
  code,
  onCopy,
  highlightPatterns,
}: {
  code: string;
  onCopy: () => void;
  highlightPatterns?: string[];
}) {
  const highlighted = useMemo(
    () => highlightCode(code, highlightPatterns),
    [code, highlightPatterns],
  );

  return (
    <div className={codeBlockClass}>
      <button className={codeCopyButtonClass} onClick={onCopy}>
        Copy
      </button>
      <pre className="m-0 overflow-x-auto px-3 py-3.5 text-[12px] leading-[1.6] text-[var(--code-text)]">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

export default function SiteSettingsPage() {
  const router = useAppRouter();
  const siteId = typeof router.query.siteId === "string" ? router.query.siteId : "";
  const [site, setSite] = useState<SiteState | null>(null);
  const [loading, setLoading] = useState(true);
  const [snippetData, setSnippetData] = useState<SnippetState | null>(null);
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeMessage, setStripeMessage] = useState("");
  const [stripeError, setStripeError] = useState("");

  useEffect(() => {
    if (!siteId) return;

    const load = async () => {
      try {
        const [siteResponse, snippetResponse] = await Promise.all([
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}/snippet`),
        ]);

        if (siteResponse.ok) {
          const payload = (await siteResponse.json()) as { site: SiteState };
          setSite(payload.site);
          setStripeSecretKey(payload.site.stripe_secret_key || "");
        }

        if (snippetResponse.ok) {
          setSnippetData((await snippetResponse.json()) as SnippetState);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [siteId]);

  const handleSaveStripe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStripeSaving(true);
    setStripeMessage("");
    setStripeError("");

    try {
      const body: Record<string, string> = {};
      if (stripeSecretKey && !stripeSecretKey.startsWith("••••")) {
        body.stripe_secret_key = stripeSecretKey;
      }

      if (!Object.keys(body).length) {
        setStripeMessage("No changes to save");
        return;
      }

      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { site?: SiteState; error?: string };
      if (!response.ok) throw new Error(payload.error || "Failed to save Stripe key");

      setStripeSecretKey(payload.site?.stripe_secret_key || "");
      setStripeMessage("Stripe key saved");
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : "Failed to save Stripe key");
    } finally {
      setStripeSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this site and all its data?")) return;
    await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
    router.push("/sites");
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (loading || !site) {
    return (
      <DashboardLayout siteId={siteId}>
        <div className={loadingInlineClass}>
          <div className={loadingSpinnerClass} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout siteId={siteId} siteName={site.name} siteDomain={site.domain}>
      <h2 className={`${pageTitleClass} mb-5`}>Site Settings</h2>

      <div className={`${panelClass} mb-5`}>
        <div className={panelHeaderClass}>
          <div className="flex items-center">
            <button className={panelTabClass(true)}>Tracking Code</button>
          </div>
        </div>
        <div className="p-5">
          {snippetData ? (
            <>
              <p className="mb-3 text-[13px] text-[var(--text-secondary)]">
                Add this snippet to your website&apos;s HTML, before the closing
                {" "}
                &lt;/head&gt; tag:
              </p>
              <CodeBlock
                code={snippetData.trackingSnippet}
                onCopy={() => void copyToClipboard(snippetData.trackingSnippet)}
              />

              <p className="mt-4 mb-3 text-[13px] text-[var(--text-secondary)]">
                For Stripe conversion tracking, pass the tracking cookies as metadata
                in your checkout:
              </p>
              <CodeBlock
                code={snippetData.stripeSnippet}
                onCopy={() => void copyToClipboard(snippetData.stripeSnippet)}
                highlightPatterns={["metadata", "ts_visitor_id", "ts_session_id"]}
              />
              <p className="mt-2 text-[12px] text-[var(--text-muted)]">
                Traffic Source will automatically sync payments from Stripe. No
                webhook setup needed.
              </p>
            </>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)]">
              Could not load snippet data.
            </p>
          )}
        </div>
      </div>

      <div className={`${panelClass} mb-5`}>
        <div className={panelHeaderClass}>
          <div className="flex items-center">
            <button className={panelTabClass(true)}>Stripe</button>
          </div>
        </div>
        <div className="p-5">
          {stripeMessage ? (
            <div className="mb-3 rounded-[var(--radius)] bg-[var(--success-light)] px-[14px] py-2.5 text-[13px] text-[var(--success)]">
              {stripeMessage}
            </div>
          ) : null}
          {stripeError ? <div className={`${authErrorClass} mb-3`}>{stripeError}</div> : null}
          <p className="mb-4 text-[13px] text-[var(--text-secondary)]">
            Enter your Stripe Secret Key. You can find it in your Stripe Dashboard
            under Developers &gt; API keys. Traffic Source will automatically sync
            your payments, no webhook setup required.
          </p>
          <form className="flex flex-col gap-4" onSubmit={handleSaveStripe}>
            <div className={formGroupClass}>
              <label className={labelClass}>Stripe Secret Key</label>
              <input
                type="password"
                value={stripeSecretKey}
                onChange={(event) => setStripeSecretKey(event.target.value)}
                placeholder="sk_live_..."
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className={`${buttonClass("primary")} self-start`}
              disabled={stripeSaving}
            >
              {stripeSaving ? "Saving..." : "Save Key"}
            </button>
          </form>
        </div>
      </div>

      <div className={panelClass} style={{ borderColor: "var(--danger)" }}>
        <div className={panelHeaderClass}>
          <div className="flex items-center">
            <button className={panelTabClass(true)} style={{ color: "var(--danger)" }}>
              Danger Zone
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="mb-4 text-[13px] text-[var(--text-secondary)]">
            Permanently delete <strong>{site.name}</strong> and all its analytics
            data. This action cannot be undone.
          </p>
          <button className={buttonClass("danger")} onClick={() => void handleDelete()}>
            Delete Site
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
