"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter as useNavigationRouter } from "next/navigation";

export type CompatQueryValue = string | string[] | undefined;
export type CompatQuery = Record<string, CompatQueryValue>;

function toSearchQuery(search: string) {
  const query: CompatQuery = {};
  if (!search) return query;

  const searchParams = new URLSearchParams(search);
  searchParams.forEach((value, key) => {
    const current = query[key];
    if (current === undefined) {
      query[key] = value;
      return;
    }
    if (Array.isArray(current)) {
      current.push(value);
      return;
    }
    query[key] = [current, value];
  });

  return query;
}

export function useAppRouter() {
  const router = useNavigationRouter();
  const pathname = usePathname();
  const params = useParams<Record<string, string | string[]>>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(typeof window === "undefined" ? "" : window.location.search);
  }, []);

  return useMemo(() => {
    const safePathname = pathname ?? "";
    const query = {
      ...params,
      ...toSearchQuery(search),
    } satisfies CompatQuery;

    return {
      push: router.push,
      replace: router.replace,
      refresh: router.refresh,
      pathname: safePathname,
      asPath: search ? `${safePathname}${search}` : safePathname,
      query,
    };
  }, [params, pathname, router, search]);
}
