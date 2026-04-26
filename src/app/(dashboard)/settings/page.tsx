"use client";

import { useEffect, useState, type FormEvent } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";
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
  pageTitleClass,
} from "@/lib/ui";

type GscCredentialsState = {
  configured: boolean;
  clientIdMasked?: string;
  redirectUri: string;
};

type GscStatusState = {
  connected: boolean;
  email?: string;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"profile" | "integrations">("profile");
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("Profile updated");
  };

  return (
    <DashboardLayout>
      <h2 className={pageTitleClass}>Account Settings</h2>
      <div className="max-w-[720px]">
        <div className={cn(panelClass, "mb-6")}>
          <div className={panelHeaderClass}>
            <div className="flex items-center">
              <button className={panelTabClass(tab === "profile")} onClick={() => setTab("profile")}>
                Profile
              </button>
              <button className={panelTabClass(tab === "integrations")} onClick={() => setTab("integrations")}>
                Integrations
              </button>
            </div>
          </div>
          <div className="p-5">
            {tab === "profile" ? (
              <form className="flex flex-col gap-4" onSubmit={handleUpdateProfile}>
                {message && (
                  <div className="rounded-[var(--radius)] bg-[var(--success-light)] px-[14px] py-2.5 text-[13px] text-[var(--success)]">
                    {message}
                  </div>
                )}
                {error && <div className={authErrorClass}>{error}</div>}
                <div className={formGroupClass}>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={`${inputClass} opacity-60`}
                  />
                </div>
                <div className={formGroupClass}>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <button type="submit" className={`${buttonClass("primary")} self-start`}>
                  Save Changes
                </button>
              </form>
            ) : (
              <GscIntegration />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SetupGuide() {
  const steps = [
    {
      n: 1,
      title: "Create a Google Cloud project",
      body: (
        <>
          Open{" "}
          <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noreferrer">
            Google Cloud → New Project
          </a>
          . Give it any name (e.g. <em>Traffic Source</em>) and click <strong>Create</strong>.
        </>
      ),
    },
    {
      n: 2,
      title: "Enable the Search Console API",
      body: (
        <>
          Open{" "}
          <a href="https://console.cloud.google.com/apis/library/searchconsole.googleapis.com" target="_blank" rel="noreferrer">
            Search Console API
          </a>{" "}
          and click <strong>Enable</strong>.
        </>
      ),
    },
    {
      n: 3,
      title: "Configure the OAuth consent screen",
      body: (
        <ul className="mt-1 list-disc pl-5">
          <li>User type: <strong>External</strong> → Create</li>
          <li>App name: anything (e.g. <em>Traffic Source</em>)</li>
          <li>Add scope <code>.../auth/webmasters.readonly</code></li>
          <li>Add the Google account(s) that own your Search Console properties as test users</li>
        </ul>
      ),
    },
    {
      n: 4,
      title: "Create the OAuth client",
      body: (
        <ul className="mt-1 list-disc pl-5">
          <li>Credentials → <strong>Create credentials</strong> → <strong>OAuth client ID</strong></li>
          <li>Application type: <strong>Web application</strong></li>
          <li>Paste the redirect URI shown above into <strong>Authorized redirect URIs</strong></li>
        </ul>
      ),
    },
    {
      n: 5,
      title: "Copy your credentials",
      body: <>Paste the resulting Client ID and Client Secret into the form below.</>,
    },
  ];

  return (
    <div className="mt-[14px] border-t border-[var(--border)] pt-[14px]">
      <div className="mb-3 text-[13px] font-semibold">How to get OAuth credentials</div>
      <div className="flex flex-col gap-[14px]">
        {steps.map((step) => (
          <div key={step.n} className="flex gap-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-[12px] font-bold text-[var(--btn-primary-text)]">
              {step.n}
            </div>
            <div className="text-[13px] leading-[1.6] text-[var(--text-muted)]">
              <div className="mb-0.5 font-semibold text-[var(--text)]">{step.title}</div>
              <div>{step.body}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[14px] text-[12px] text-[var(--text-muted)]">
        Tip: once configured, every site in your account can connect to Search Console with one click.
      </div>
    </div>
  );
}

function GscIntegration() {
  const [state, setState] = useState<GscCredentialsState | null>(null);
  const [connection, setConnection] = useState<GscStatusState | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const [credentialsResponse, statusResponse] = await Promise.all([
      fetch("/api/settings/integrations/gsc/credentials"),
      fetch("/api/settings/integrations/gsc/status"),
    ]);
    if (credentialsResponse.ok) {
      setState((await credentialsResponse.json()) as GscCredentialsState);
    }
    if (statusResponse.ok) {
      setConnection((await statusResponse.json()) as GscStatusState);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setError(decodeURIComponent(params.get("error") || ""));
    if (params.get("connected")) setMessage("Google account connected.");
  }, []);

  const startConnect = async () => {
    setError("");
    const response = await fetch("/api/settings/integrations/gsc/connect");
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      setError(data.error || "Unable to start OAuth flow");
      return;
    }
    window.location.href = data.url;
  };

  const disconnectGoogle = async () => {
    if (!confirm("Disconnect your Google account? All linked sites will stop syncing.")) return;
    await fetch("/api/settings/integrations/gsc/disconnect", { method: "POST" });
    void load();
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/settings/integrations/gsc/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });
    setSaving(false);
    if (response.ok) {
      setMessage("Credentials saved. Now connect your Google account.");
      setClientId("");
      setClientSecret("");
      void load();
    } else {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Failed to save");
    }
  };

  const remove = async () => {
    if (!confirm("Remove Google Search Console credentials?")) return;
    await fetch("/api/settings/integrations/gsc/credentials", { method: "DELETE" });
    void load();
  };

  const copyRedirect = async () => {
    if (!state?.redirectUri) return;
    await navigator.clipboard.writeText(state.redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!state) {
    return (
      <div className={loadingInlineClass}>
        <div className={loadingSpinnerClass} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="m-0 text-[16px]">Google Search Console</h3>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          Connect once with your Google Cloud OAuth credentials. Then any site can be linked with one click.
        </p>
      </div>

      {message && (
        <div className="rounded-[var(--radius)] bg-[var(--success-light)] px-[14px] py-2.5 text-[13px] text-[var(--success)]">
          {message}
        </div>
      )}
      {error && <div className={authErrorClass}>{error}</div>}

      <div>
        <div className="mb-1.5 text-[12px] font-semibold tracking-[0.5px] text-[var(--text-muted)] uppercase">
          Step 1 — Copy this Redirect URI
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 overflow-auto rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[12px] text-[var(--text)]">
            {state.redirectUri}
          </code>
          <button type="button" className={buttonClass("secondary", "sm")} onClick={copyRedirect}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-2 text-[12px] text-[var(--text-muted)]">
          Paste this into <strong>Authorized redirect URIs</strong>.{" "}
          <button
            type="button"
            onClick={() => setShowHelp((current) => !current)}
            className="cursor-pointer border-none bg-transparent p-0 text-[12px] text-[var(--text)]"
          >
            How to get OAuth credentials? {showHelp ? "▲" : "▼"}
          </button>
        </div>
        {showHelp && <SetupGuide />}
      </div>

      {state.configured && (
        <div className="flex items-center gap-3 rounded-[var(--radius)] bg-[var(--success-light)] p-3 text-[13px]">
          <span className="font-semibold text-[var(--success)]">✓ Credentials saved</span>
          <span className="text-[var(--text-muted)]">Client ID: {state.clientIdMasked}</span>
          <button type="button" className={`${buttonClass("secondary", "sm")} ml-auto`} onClick={remove}>
            Remove
          </button>
        </div>
      )}

      <form className="flex flex-col gap-3" onSubmit={save}>
        <div className="text-[12px] font-semibold tracking-[0.5px] text-[var(--text-muted)] uppercase">
          Step 2 — Paste your OAuth credentials
        </div>
        <div className={formGroupClass}>
          <label className={labelClass}>Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder="123456789-abc.apps.googleusercontent.com"
            className={inputClass}
          />
        </div>
        <div className={formGroupClass}>
          <label className={labelClass}>Client Secret</label>
          <input
            type="password"
            value={clientSecret}
            onChange={(event) => setClientSecret(event.target.value)}
            placeholder="GOCSPX-..."
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className={`${buttonClass("primary")} self-start`}
          disabled={saving || !clientId || !clientSecret}
        >
          {saving ? "Saving…" : state.configured ? "Update Credentials" : "Save Credentials"}
        </button>
      </form>

      <div>
        <div className="mb-2 text-[12px] font-semibold tracking-[0.5px] text-[var(--text-muted)] uppercase">
          Step 3 — Connect your Google account
        </div>
        {!state.configured && (
          <p className="m-0 text-[13px] text-[var(--text-muted)]">
            Save your OAuth credentials above first.
          </p>
        )}
        {state.configured && connection?.connected && (
          <div className="flex items-center gap-3 text-[13px]">
            <span className="font-semibold text-[var(--success)]">✓ Connected</span>
            <span className="text-[var(--text-muted)]">{connection.email}</span>
            <button type="button" className={`${buttonClass("secondary", "sm")} ml-auto`} onClick={disconnectGoogle}>
              Disconnect
            </button>
          </div>
        )}
        {state.configured && !connection?.connected && (
          <button type="button" className={buttonClass("primary")} onClick={startConnect}>
            Connect Google Search Console
          </button>
        )}
      </div>
    </div>
  );
}
