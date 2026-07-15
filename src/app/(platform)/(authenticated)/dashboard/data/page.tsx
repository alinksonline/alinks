import { eq } from "drizzle-orm";
import { OrdersSheetForm } from "@/components/platform/orders-sheet-form";
import { SettingsSection } from "@/components/platform/settings-section";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { supabaseConnectors } from "@/platform/db/schema";
import { getServiceAccountEmail, isGoogleSheetsConfigured } from "@/tenant/storage/google-auth";
import { DataSupabaseByoForm } from "./data-supabase-byo-form";
import { ManagedStorageCard } from "./managed-storage-card";

/**
 * TENANT data plane (not platform Billing, not Checkout).
 *
 * ALINKS does NOT manage/host customer databases (support + liability).
 * Options only:
 * 1. Google Sheets — default
 * 2. BYO Supabase — tenant account (affiliate signup), they pay Supabase
 */
export default async function DataPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const connector = db
    ? (
        await db
          .select()
          .from(supabaseConnectors)
          .where(eq(supabaseConnectors.businessId, business.id))
          .limit(1)
      )[0]
    : null;

  const backend = business.storageBackend ?? "google_sheets";

  return (
    <PageShell maxWidth="md" className="py-6 pb-12">
      <p className="premium-label">Your business · data</p>
      <h1 className="premium-heading mt-1 text-xl">Data</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Where <strong>customer</strong> orders and bookings are stored. ALINKS platform DB only keeps your
        site config — never your clients&apos; PII.
      </p>

      <div className="mt-2 rounded-xl border border-brand-ink/10 bg-brand-mist/40 px-3 py-2 text-[12px] text-brand-muted">
        Active backend:{" "}
        <strong className="text-brand-ink">
          {backend === "supabase"
            ? "Supabase"
            : backend === "dev_files"
              ? "Dev files"
              : "Google Sheets"}
        </strong>
      </div>

      <div className="mt-6 space-y-4">
        <OrdersSheetForm
          businessId={business.id}
          spreadsheetId={business.googleSpreadsheetId ?? ""}
          googleConfigured={isGoogleSheetsConfigured()}
          serviceAccountEmail={getServiceAccountEmail()}
          stepLabel="A · Google Sheets"
        />

        <SettingsSection
          step="B · Your own database"
          title="Your own Supabase"
          description="Optional. You open a Supabase account (we may earn affiliate credit), you pay them, you own the project. ALINKS only connects — we never host your customer DB."
        >
          <DataSupabaseByoForm
            businessId={business.id}
            projectUrl={connector?.projectUrl ?? ""}
            connected={Boolean(connector?.isActive && backend === "supabase")}
            storageBackend={backend}
          />
        </SettingsSection>

        <ManagedStorageCard />
      </div>
    </PageShell>
  );
}
