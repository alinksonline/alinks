import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/core/utils/cn";

type ButtonVariant = "primary" | "bronze" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/** Compact default control height — override with className only when needed. */
const variants: Record<ButtonVariant, string> = {
  primary: "premium-btn-primary",
  bronze: "premium-btn-bronze",
  secondary:
    "w-full min-h-[var(--ctrl-h)] rounded-[var(--ctrl-radius)] border border-brand-ink/10 bg-brand-mist px-3 py-1.5 text-[0.8125rem] font-semibold text-brand-ink",
  ghost: "premium-btn-ghost",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition disabled:opacity-45 active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
