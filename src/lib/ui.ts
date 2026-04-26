// @ts-nocheck
import { cn } from "@/lib/cn";

export const buttonBaseClass =
  "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-transparent text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

export const panelClass =
  "overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]";

export const panelHeaderClass =
  "flex min-h-11 items-center justify-between border-b border-[var(--border)] px-4";

export const panelTabsClass = "flex items-center";

export const pageTitleClass =
  "text-[18px] font-semibold text-[var(--text-heading)]";

export const formGroupClass = "flex flex-col gap-1.5";

export const labelClass =
  "text-[13px] font-medium text-[var(--text-secondary)]";

export const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-input)] px-[14px] py-2.5 text-[14px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--focus-ring)]";

export const authErrorClass =
  "rounded-[var(--radius-sm)] bg-[var(--danger-light)] px-[14px] py-2.5 text-[13px] text-[var(--danger)]";

export const loadingScreenClass =
  "flex min-h-screen items-center justify-center bg-[var(--bg)]";

export const loadingInlineClass = "flex items-center justify-center px-6 py-[60px]";

export const loadingSpinnerClass =
  "size-7 rounded-full border-[3px] border-[var(--border)] border-t-[var(--text)] animate-[spin_0.6s_linear_infinite]";

export const emptyStateClass =
  "px-5 py-10 text-center text-[13px] text-[var(--text-secondary)]";

export const emptyStateTitleClass =
  "mb-1.5 text-[15px] font-medium text-[var(--text-heading)]";

export const codeBlockClass =
  "relative rounded-[var(--radius-sm)] border border-[var(--code-border)] bg-[var(--code-bg)]";

export const codeCopyButtonClass =
  "absolute right-2 top-2 rounded-[5px] border border-[var(--code-btn-border)] bg-[var(--code-btn-bg)] px-2.5 py-1 text-[11px] text-[var(--code-btn-text)] transition hover:bg-[var(--code-btn-hover-bg)] hover:text-[var(--code-btn-hover-text)]";

export function buttonClass(
  variant: "primary" | "secondary" | "ghost" | "danger" = "primary",
  size: "md" | "sm" = "md",
  fullWidth = false,
) {
  return cn(
    buttonBaseClass,
    size === "md" ? "px-5 py-2.5" : "px-3 py-1.5 text-[13px]",
    variant === "primary" &&
      "bg-[var(--text)] text-[var(--btn-primary-text)] hover:bg-[var(--accent-hover)]",
    variant === "secondary" &&
      "border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[var(--hover-border)] hover:bg-[var(--bg-surface)]",
    variant === "ghost" &&
      "border-transparent bg-transparent px-3 py-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]",
    variant === "danger" && "bg-[var(--danger)] text-white hover:opacity-85",
    fullWidth && "w-full",
  );
}

export function panelTabClass(active: boolean) {
  return cn(
    "mb-[-1px] whitespace-nowrap border-b-2 px-[14px] py-3 text-[13px] font-medium transition-colors",
    active
      ? "border-[var(--text)] font-semibold text-[var(--text)]"
      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]",
  );
}
