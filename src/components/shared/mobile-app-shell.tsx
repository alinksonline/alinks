import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

export type MobileShellVariant = "marketing" | "platform" | "tenant";

const shellInner: Record<MobileShellVariant, string> = {
  /* Marketing landing follows the global theme. */
  marketing: "alinks-chrome bg-brand-surface text-brand-ink dark:bg-[#050505] dark:text-brand-cream",
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
  /* Marketing frame dynamically switches based on theme. */
  const frameClass = cn(
    "mobile-app-frame min-w-0",
    isMarketing && "bg-brand-surface dark:bg-black",
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