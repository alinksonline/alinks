import { eq } from "drizzle-orm";
import { LocaleSwitcher } from "@/components/platform/locale-switcher";
import { PageShell } from "@/components/shared/page-shell";
import { ThemeSettings } from "@/components/shared/theme-settings";
import type { AppLocale } from "@/core/i18n/messages";
import { t } from "@/core/i18n/messages";
import { requireAuth } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await requireAuth();
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const locale = (tenant?.locale ?? "en") as AppLocale;

  return (
    <PageShell maxWidth="md" className="py-10">
      <h1 className="text-2xl font-bold">{t(locale, "settings.title")}</h1>
      <div className="mt-6 space-y-8">
        <div>
          <h2 className="font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-brand-ink/55">Light, dark, or match your device.</p>
          <div className="mt-3">
            <ThemeSettings />
          </div>
        </div>
        <div>
          <h2 className="font-semibold">{t(locale, "settings.locale")}</h2>
          <div className="mt-2">
            <LocaleSwitcher locale={locale} />
          </div>
        </div>
        <SettingsForm region={tenant?.region ?? "IN"} adsOptIn={tenant?.adsOptIn ?? false} />
      </div>
    </PageShell>
  );
}