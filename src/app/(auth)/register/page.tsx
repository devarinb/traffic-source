"use client";

import { useEffect, useState, type FormEvent } from "react";

import LogoMark from "@/components/ui/LogoMark";
import { useAuth } from "@/contexts/AuthContext";
import { useAppRouter } from "@/hooks/useAppRouter";
import {
  authErrorClass,
  buttonClass,
  formGroupClass,
  inputClass,
  labelClass,
  loadingScreenClass,
  loadingSpinnerClass,
} from "@/lib/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useAppRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data: { hasUsers?: boolean }) => {
        if (data.hasUsers) {
          router.replace("/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className={loadingScreenClass}>
        <div className={loadingSpinnerClass} />
      </div>
    );
  }

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
          Create your admin account
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <div className={authErrorClass}>{error}</div>}
          <div className={formGroupClass}>
            <label className={labelClass} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>
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
              placeholder="Min 8 characters"
              required
              className={inputClass}
            />
          </div>
          <div className={formGroupClass}>
            <label className={labelClass} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              required
              className={inputClass}
            />
          </div>
          <button type="submit" className={buttonClass("primary", "md", true)} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
