"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { DateRangeParams } from "@/types/app";

type DateRangeContextValue = {
  period: string;
  setPeriod: (value: string) => void;
  customRange: DateRangeParams | null;
  setCustomRange: (value: DateRangeParams | null) => void;
  getParams: () => DateRangeParams;
};

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

type DateRangeProviderProps = {
  children: ReactNode;
};

export function DateRangeProvider({ children }: DateRangeProviderProps) {
  const [period, setPeriod] = useState("30d");
  const [customRange, setCustomRange] = useState<DateRangeParams | null>(null);

  const value = useMemo<DateRangeContextValue>(
    () => ({
      period,
      setPeriod,
      customRange,
      setCustomRange,
      getParams: () => customRange ?? { period },
    }),
    [customRange, period],
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used inside DateRangeProvider");
  }
  return context;
}
