import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

export type MobileShellVariant = "marketing" | "platform" | "tenant";

const shellInner: Record<MobileShellVariant, string> = {
  /* alinks-chrome = platform/marketing surfaces where dark-mode contrast remaps apply */
  marketing: "alinks-chrome bg-brand-cream",
  platform: "alinks-chrome bg-brand-cream",
  /* Tenant public mini-sites keep their own light Linktree cards */
  tenant: "bg-brand-surface",
};

type MobileAppShellProps = {
  children: ReactNode;
  variant?: MobileShellVariant;
  className?: string;
  /** When false, children render full-bleed (e.g. tenant custom themes). */
  framed?: boolean;
};

/**
 * ALINKS is a mobile web app first. On every screen size the UI stays phone-width,
 * edge-to-edge on real phones, centered device frame on tablet/desktop.
 */
export function MobileAppShell({
  children,
  variant = "marketing",
  className,
  framed = true,
}: MobileAppShellProps) {
  if (!framed) {
    return (
      <div className={cn("mobile-app-frame min-w-0", className)}>
        <div className="mobile-app-viewport">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("mobile-app-frame min-w-0", className)}>
      <div className={cn("mobile-app-viewport", shellInner[variant])}>{children}</div>
    </div>
  );
}