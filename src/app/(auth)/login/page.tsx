"use client";

import { useState, type FormEvent } from "react";

import LogoMark from "@/components/ui/LogoMark";
import { useAuth } from "@/contexts/AuthContext";
import {
  authErrorClass,
  buttonClass,
  formGroupClass,
  inputClass,
  labelClass,
} from "@/lib/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 py-5">
      <div className="w-full max-w-[420px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-10">
        <div className="mb-4 text-[var(--text)]">
          <LogoMark size={32} />
        </div>
        <h1 className="mb-1 text-[22px] font-bold text-[var(--text-heading)]">
          Traffic Source
        </h1>
        <p className="mb-6 text-[14px] text-[var(--text-secondary)]">
          Sign in to your analytics dashboard
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <div className={authErrorClass}>{error}</div>}
          <div className={formGroupClass}>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>
          <div className={formGroupClass}>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
              className={inputClass}
            />
          </div>
          <button type="submit" className={buttonClass("primary", "md", true)} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
