"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAppRouter } from "@/hooks/useAppRouter";
import type { ApiError, User } from "@/types/app";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useAppRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await parseJson<{ user: User }>(res);
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseJson<{ user: User } & ApiError>(res);
      if (!res.ok) {
        throw new Error(data.error || "Unable to sign in");
      }
      setUser(data.user);
      router.push("/");
      return { user: data.user };
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await parseJson<{ user: User } & ApiError>(res);
      if (!res.ok) {
        throw new Error(data.error || "Unable to create account");
      }
      setUser(data.user);
      router.push("/");
      return { user: data.user };
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refetchUser: fetchUser,
    }),
    [fetchUser, loading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
