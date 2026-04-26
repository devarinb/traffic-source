export type Maybe<T> = T | null;

export type User = {
  id: number;
  email: string;
  name: string | null;
};

export type Theme = "dark" | "light";

export type DateRangeParams = {
  from?: string;
  to?: string;
  period?: string;
};

export type MetricItem = {
  label: string;
  value: number | string | null | undefined;
  change?: number | null;
  format?: "currency" | "percent" | "duration";
};

export type ApiError = {
  error?: string;
};
