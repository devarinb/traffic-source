import { emptyStateClass } from "@/lib/ui";

type TableColumn<T> = {
  key: keyof T & string;
  label: string;
  align?: "left" | "right";
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[];
  data: T[];
  maxBar?: keyof T & string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  maxBar,
}: DataTableProps<T>) {
  if (!data.length) {
    return (
      <div className={emptyStateClass}>
        <p>No data for this period</p>
      </div>
    );
  }

  const maxValue = maxBar
    ? Math.max(...data.map((row) => Number(row[maxBar] || 0)))
    : 0;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={`border-b border-[var(--border)] px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)] ${column.align === "right" ? "text-right" : "text-left"}`}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="hover:[&_td]:bg-[var(--bg-card-hover)]">
            {columns.map((column, columnIndex) => {
              const value = row[column.key];
              const isBarCol = Boolean(maxBar && columnIndex === 0);
              const barWidth =
                isBarCol && maxValue > 0
                  ? `${(Number(row[maxBar as keyof T] || 0) / maxValue) * 100}%`
                  : null;

              return (
                <td
                  key={column.key}
                  className={`relative border-b border-[var(--border-light)] px-4 py-2.5 text-[13px] last:border-b-0 ${column.align === "right" ? "text-right [font-variant-numeric:tabular-nums]" : ""}`}
                >
                  {isBarCol && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[var(--bar-color)]"
                      style={{ width: barWidth ?? undefined }}
                    />
                  )}
                  <span className={isBarCol ? "relative z-[1]" : undefined}>
                    {column.render ? column.render(value, row) : String(value ?? "")}
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
