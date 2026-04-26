"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Theme } from "@/types/app";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const datasetTheme = document.documentElement.dataset.theme;
    if (datasetTheme === "light" || datasetTheme === "dark") {
      return datasetTheme;
    }
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#ffffff" : "#000000");
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
