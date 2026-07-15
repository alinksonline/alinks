import { eq } from "drizzle-orm";
import { LocaleSwitcher } from "@/components/platform/locale-switcher";
import { OrdersSheetForm } from "@/components/platform/orders-sheet-form";
import { SettingsSection } from "@/components/platform/settings-section";
import { PageShell } from "@/components/shared/page-shell";
import { ThemeSettings } from "@/components/shared/theme-settings";
import type { AppLocale } from "@/core/i18n/messages";
import { t } from "@/core/i18n/messages";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { getServiceAccountEmail, isGoogleSheetsConfigured } from "@/tenant/storage/google-auth";
import { SettingsForm } from "./settings-form";

/**
 * Settings order (standard):
 * 01 Data → 02 Region → 03 Ads → 04 Export → 05 Delete
 * Plus Appearance / Language at top as account UI prefs.
 */
export default async function SettingsPage() {
  const session = await requireAuth();
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const business = await getBusinessForTenant(session.userId);
  const locale = (tenant?.locale ?? "en") as AppLocale;

  return (
    <PageShell maxWidth="md" className="py-6 pb-12">
      <p className="premium-label">Account</p>
      <h1 className="premium-heading mt-1 text-xl">{t(locale, "settings.title")}</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Your account, data storage, and privacy. Customer payments are under Website → Checkout.
        Your ALINKS plan is under Billing.
      </p>

      <div className="mt-6 space-y-4">
        {/* 0 · App UI (not numbered business data) */}
        <SettingsSection
          step="00 · App"
          title="Appearance"
          description="Light, dark, or match your device — for the ALINKS dashboard only."
        >
          <ThemeSettings />
        </SettingsSection>

        <SettingsSection
          step="00 · App"
          title="Language"
          description="Dashboard language for your ALINKS account."
        >
          <LocaleSwitcher locale={locale} />
        </SettingsSection>

        {/* 01 · Business data storage */}
        {business ? (
          <OrdersSheetForm
            businessId={business.id}
            spreadsheetId={business.googleSpreadsheetId ?? ""}
            googleConfigured={isGoogleSheetsConfigured()}
            serviceAccountEmail={getServiceAccountEmail()}
          />
        ) : (
          <SettingsSection
            step="01 · Data"
            title="Orders & bookings sheet"
            description="Create a business first (onboarding) to connect a Google Sheet."
          >
            <p className="text-sm text-brand-muted">No business yet.</p>
          </SettingsSection>
        )}

        {/* 02–05 via form */}
        <SettingsForm region={tenant?.region ?? "IN"} adsOptIn={tenant?.adsOptIn ?? false} />
      </div>
    </PageShell>
  );
}
