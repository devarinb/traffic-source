import type { MetricItem } from "@/types/app";

type MetricStripProps = {
  metrics: MetricItem[];
};

export default function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <div className="mb-5 flex gap-3 overflow-x-auto max-md:flex-wrap">
      {metrics.map((metric, index) => {
        const changeVal = metric.change;
        const isUp = Number(changeVal) > 0;
        const isDown = Number(changeVal) < 0;

        return (
          <div
            key={index}
            className="min-w-[140px] flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 max-md:min-w-[45%]"
          >
            <div className="mb-1.5 text-[12px] font-medium text-[var(--text-muted)]">
              {metric.label}
            </div>
            <div className="text-[24px] leading-[1.2] font-bold tracking-[-0.5px] text-[var(--text-heading)] [font-variant-numeric:tabular-nums]">
              {formatValue(metric.value, metric.format)}
            </div>
            {changeVal !== undefined && changeVal !== null && (
              <div
                className={[
                  "mt-1.5 inline-flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-semibold",
                  isUp ? "bg-[var(--success-light)] text-[var(--success)]" : "",
                  isDown ? "bg-[var(--danger-light)] text-[var(--danger)]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isDown ? "" : "+"}
                {changeVal}% {isUp ? "\u2191" : isDown ? "\u2193" : ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatValue(
  value: number | string | null | undefined,
  format?: MetricItem["format"],
) {
  if (value === undefined || value === null) return "-";
  if (format === "currency" && typeof value === "number") {
    return `$${(value / 100).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
  if (format === "percent") return `${value}%`;
  if (format === "duration" && typeof value === "number") {
    if (!value) return "0s";
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }
  if (typeof value === "number") {
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return value.toLocaleString();
  }
  return value;
}
