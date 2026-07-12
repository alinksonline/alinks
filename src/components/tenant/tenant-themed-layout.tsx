import type { ReactNode } from "react";
import type { ThemeConfig } from "@/core/types/page";
import { resolveTenantTheme } from "@/core/utils/tenant-theme";
import { cn } from "@/core/utils/cn";

/**
 * 100% themed layout base for public tenant mini-sites.
 * Applies CSS variables from ThemeConfig so header, stack, footer, store, etc. share one look.
 */
export function TenantThemedLayout({
  theme: rawTheme,
  fallbackPrimary,
  children,
  className,
}: {
  theme?: ThemeConfig | Record<string, unknown> | null;
  fallbackPrimary?: string;
  children: ReactNode;
  className?: string;
}) {
  const resolved = resolveTenantTheme(rawTheme, fallbackPrimary);

  return (
    <div
      className={cn("tenant-theme min-h-dvh w-full", className)}
      data-mode={resolved.theme.mode}
      style={resolved.style}
    >
      {children}
    </div>
  );
}
