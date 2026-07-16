import type { ReactNode } from "react";
import type { ThemeConfig } from "@/core/types/page";
import { resolveTenantTheme } from "@/core/utils/tenant-theme";
import { cn } from "@/core/utils/cn";

/**
 * 100% themed layout base for public tenant mini-sites.
 * Applies CSS variables from ThemeConfig so header, stack, footer, store, etc. share one look.
 * Loads the selected Google Font when needed so theme fonts actually render.
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
    <>
      {resolved.googleFontsHref ? (
        <>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={resolved.googleFontsHref} />
        </>
      ) : null}
      <div
        className={cn("tenant-theme min-h-dvh w-full font-sans antialiased", className)}
        data-mode={resolved.theme.mode}
        data-font={resolved.theme.fontFamily}
        style={resolved.style}
      >
        {children}
      </div>
    </>
  );
}
