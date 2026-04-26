"use client";

import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useAppRouter } from "@/hooks/useAppRouter";
import { loadingScreenClass, loadingSpinnerClass } from "@/lib/ui";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useAppRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/sites");
      return;
    }

    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data: { hasUsers?: boolean }) => {
        router.replace(data.hasUsers ? "/login" : "/register");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [loading, router, user]);

  return (
    <div className={loadingScreenClass}>
      <div className={loadingSpinnerClass} />
    </div>
  );
}
