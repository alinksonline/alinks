import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const widths = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function PageShell({ children, className, maxWidth = "lg" }: PageShellProps) {
  return <div className={cn("mx-auto w-full px-4", widths[maxWidth], className)}>{children}</div>;
}