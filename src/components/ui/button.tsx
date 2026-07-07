import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/core/utils/cn";

type ButtonVariant = "primary" | "bronze" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "premium-btn-primary",
  bronze: "premium-btn-bronze",
  secondary: "bg-brand-mist text-brand-ink hover:bg-brand-mist/80 border border-brand-ink/8 rounded-xl px-5 py-3.5 text-sm font-semibold",
  ghost: "premium-btn-ghost",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}