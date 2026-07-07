"use client";

import { cn } from "@/core/utils/cn";
import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  className?: string;
  /** Compact icon-only for nav bars */
  compact?: boolean;
};

export function ThemeToggle({ className, compact = true }: ThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition active:scale-95",
        compact ? "h-9 w-9" : "h-11 gap-2 px-4 text-sm font-medium",
        "border border-brand-ink/10 bg-brand-surface text-brand-ink/70",
        "hover:bg-brand-mist/80",
        className,
      )}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 14.5A7.5 7.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {!compact && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}