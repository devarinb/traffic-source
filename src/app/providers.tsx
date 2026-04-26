"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DateRangeProvider>{children}</DateRangeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
