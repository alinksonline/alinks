"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/core/i18n/messages";
import { t } from "@/core/i18n/messages";
import type { SessionRole } from "@/core/types/auth";
import { cn } from "@/core/utils/cn";

type Tab = { href: string; label: string; match: (path: string) => boolean };

function buildTabs(locale: AppLocale, role: SessionRole): Tab[] {
  const tabs: Tab[] = [
    { href: "/dashboard", label: t(locale, "nav.home"), match: (p) => p === "/dashboard" },
    { href: "/editor", label: t(locale, "nav.website"), match: (p) => p.startsWith("/editor") },
    { href: "/dashboard/share", label: t(locale, "nav.share"), match: (p) => p.startsWith("/dashboard/share") },
    { href: "/billing", label: t(locale, "nav.billing"), match: (p) => p.startsWith("/billing") },
    {
      href: "/dashboard/settings",
      label: t(locale, "nav.settings"),
      match: (p) =>
        p.startsWith("/dashboard/settings") ||
        p.startsWith("/dashboard/domain") ||
        p.startsWith("/dashboard/ai") ||
        p.startsWith("/dashboard/data") ||
        p.startsWith("/dashboard/integrations"),
    },
  ];
  if (role === "superadmin") {
    tabs.push({ href: "/superadmin", label: "Admin", match: (p) => p.startsWith("/superadmin") });
  }
  return tabs;
}

export function PlatformTabBar({ role, locale = "en" }: { role: SessionRole; locale?: AppLocale }) {
  const pathname = usePathname();
  const tabs = buildTabs(locale, role).slice(0, 5);

  return (
    <nav className="platform-tab-bar" aria-label="Main navigation">
      <div className="flex h-14 items-stretch justify-around px-0.5">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] font-semibold transition",
                active ? "text-brand-turquoise" : "text-brand-muted",
              )}
            >
              <span
                className={cn(
                  "h-0.5 w-6 rounded-full transition",
                  active ? "bg-brand-gradient" : "bg-transparent",
                )}
              />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}