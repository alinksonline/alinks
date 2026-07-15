import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

/** Standard Settings block — numbered, same card chrome everywhere. */
export function SettingsSection({
  step,
  title,
  description,
  children,
  variant = "default",
  className,
}: {
  step?: string;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "danger";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "premium-card space-y-3 p-4",
        variant === "danger" && "border-red-500/25 bg-red-500/5",
        className,
      )}
    >
      <header>
        {step ? (
          <p
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-widest",
              variant === "danger" ? "text-red-700/80 dark:text-red-300/80" : "text-brand-muted",
            )}
          >
            {step}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-base font-bold tracking-tight",
            variant === "danger" ? "text-red-800 dark:text-red-200" : "text-brand-ink",
            step ? "mt-0.5" : "",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[12px] leading-relaxed text-brand-muted">{description}</p>
        ) : null}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
