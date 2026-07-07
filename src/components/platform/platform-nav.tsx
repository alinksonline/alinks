import Link from "next/link";
import { ThemeAwareLogo } from "@/components/shared/theme-aware-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { AppLocale } from "@/core/i18n/messages";
import type { SessionRole } from "@/core/types/auth";
import { PlatformTabBar } from "@/components/platform/platform-tab-bar";

export function PlatformNav({ role, locale = "en" }: { role: SessionRole; locale?: AppLocale }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-ink/[0.06] bg-brand-cream/95 backdrop-blur-md supports-[backdrop-filter]:bg-brand-cream/85">
        <div className="app-container flex h-14 items-center justify-between gap-2">
          <Link href="/dashboard" className="shrink-0">
            <ThemeAwareLogo height={24} />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-xs font-medium text-brand-ink/50">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <PlatformTabBar role={role} locale={locale} />
    </>
  );
}