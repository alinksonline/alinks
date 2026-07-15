import { eq } from "drizzle-orm";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/platform/locale-switcher";
import { SettingsSection } from "@/components/platform/settings-section";
import { PageShell } from "@/components/shared/page-shell";
import { ThemeSettings } from "@/components/shared/theme-settings";
import type { AppLocale } from "@/core/i18n/messages";
import { t } from "@/core/i18n/messages";
import { requireAuth } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { SettingsForm } from "./settings-form";

/**
 * Account prefs only.
 * Customer data storage → /dashboard/data
 * ALINKS plan → /billing
 * Customer pay methods → /editor/commerce
 */
export default async function SettingsPage() {
  const session = await requireAuth();
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const locale = (tenant?.locale ?? "en") as AppLocale;

  return (
    <PageShell maxWidth="md" className="py-6 pb-12">
      <p className="premium-label">Account</p>
      <h1 className="premium-heading mt-1 text-xl">{t(locale, "settings.title")}</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Dashboard preferences and account controls. Orders storage is under{" "}
        <Link href="/dashboard/data" className="font-semibold text-brand-purple underline">
          Data
        </Link>
        ; your ALINKS plan under Billing.
      </p>

      <div className="mt-6 space-y-4">
        <SettingsSection
          step="01 · App"
          title="Appearance"
          description="Light, dark, or match your device — for the ALINKS dashboard only."
        >
          <ThemeSettings />
        </SettingsSection>

        <SettingsSection
          step="02 · App"
          title="Language"
          description="Dashboard language for your ALINKS account."
        >
          <LocaleSwitcher locale={locale} />
        </SettingsSection>

        <SettingsForm region={tenant?.region ?? "IN"} adsOptIn={tenant?.adsOptIn ?? false} />
      </div>
    </PageShell>
  );
}
