import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ThemeAwareLogo } from "@/components/shared/theme-aware-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type AuthMode = "signup" | "login";

interface AuthShellProps {
  mode: AuthMode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ mode, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-brand-cream">
      <div className="pointer-events-none absolute inset-0 bg-premium-radial" />

      <header className="relative z-10 border-b border-brand-ink/[0.06] bg-brand-cream/90 backdrop-blur-md">
        <div className="app-container flex h-14 items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <ThemeAwareLogo height={26} priority />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="text-xs font-medium text-brand-ink/50">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 app-container py-6">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[240px] overflow-hidden rounded-2xl border border-brand-ink/[0.08] shadow-card">
          <Image
            src="/assets/marketing/hero-device-showcase.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="240px"
            priority
          />
        </div>

        <p className="premium-label mt-6">{mode === "signup" ? "Get started" : "Welcome back"}</p>
        <h1 className="premium-heading mt-2 font-display">
          {mode === "signup" ? "Start your 14-day Pro trial" : "Sign in to ALINKS"}
        </h1>
        <p className="premium-subtext mt-2">{subtitle}</p>

        <div className="premium-card mt-8 shadow-soft">
          <div className="border-b border-brand-ink/[0.06] px-5 py-4">
            <h2 className="font-semibold text-brand-ink">{title}</h2>
          </div>
          <div className="px-5 py-6">{children}</div>
          {footer && <div className="border-t border-brand-ink/[0.06] px-5 py-4 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </main>
  );
}