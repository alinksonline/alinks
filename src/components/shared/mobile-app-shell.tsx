import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

export type MobileShellVariant = "marketing" | "platform" | "tenant";

const shellInner: Record<MobileShellVariant, string> = {
  /* Marketing landing is a locked dark premium surface (not user-theme driven). */
  marketing: "alinks-chrome dark bg-[#050505] text-brand-cream",
  /* Platform chrome follows theme tokens via .dark on <html>. */
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
  const isMarketing = variant === "marketing";
  /* Marketing forces a dark device bezel so the premium landing never sits on a light frame. */
  const frameClass = cn(
    "mobile-app-frame min-w-0",
    isMarketing && "dark bg-black",
    className,
  );

  if (!framed) {
    return (
      <div className={frameClass}>
        <div className={cn("mobile-app-viewport", isMarketing && shellInner.marketing)}>{children}</div>
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <div className={cn("mobile-app-viewport", shellInner[variant])}>{children}</div>
    </div>
  );
}