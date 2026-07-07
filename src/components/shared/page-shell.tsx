import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  /** Mobile-first: all widths cap at phone shell (430px). */
  maxWidth?: "app" | "sm" | "md" | "lg" | "xl";
}

const widths = {
  app: "max-w-app",
  sm: "max-w-app",
  md: "max-w-app",
  lg: "max-w-app",
  xl: "max-w-app",
};

export function PageShell({ children, className, maxWidth = "app" }: PageShellProps) {
  return <div className={cn("app-container", widths[maxWidth], className)}>{children}</div>;
}