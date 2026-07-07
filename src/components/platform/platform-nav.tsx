import Link from "next/link";
import type { AppLocale } from "@/core/i18n/messages";
import { t } from "@/core/i18n/messages";
import type { SessionRole } from "@/core/types/auth";

export function PlatformNav({ role, locale = "en" }: { role: SessionRole; locale?: AppLocale }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight text-slate-900">
          ALINKS Dashboard
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.home")}
          </Link>
          <Link href="/editor" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.website")}
          </Link>
          <Link href="/dashboard/share" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.share")}
          </Link>
          <Link href="/dashboard/domain" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.domain")}
          </Link>
          <Link href="/dashboard/ai" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.ai")}
          </Link>
          <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.settings")}
          </Link>
          <Link href="/dashboard/integrations/supabase" className="text-slate-600 hover:text-slate-900">
            Supabase
          </Link>
          <Link href="/dashboard/integrations/meta" className="text-slate-600 hover:text-slate-900">
            Meta
          </Link>
          <Link href="/billing" className="text-slate-600 hover:text-slate-900">
            {t(locale, "nav.billing")}
          </Link>
          {role === "superadmin" && (
            <Link href="/superadmin" className="text-slate-600 hover:text-slate-900">
              Superadmin
            </Link>
          )}
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-slate-500 hover:text-slate-900">
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}