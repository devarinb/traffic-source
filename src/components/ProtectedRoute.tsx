"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useAppRouter } from "@/hooks/useAppRouter";
import { loadingScreenClass, loadingSpinnerClass } from "@/lib/ui";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useAppRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className={loadingScreenClass}>
        <div className={loadingSpinnerClass} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
