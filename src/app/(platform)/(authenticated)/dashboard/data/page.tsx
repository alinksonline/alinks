import { eq } from "drizzle-orm";
import { OrdersSheetForm } from "@/components/platform/orders-sheet-form";
import { OwnGoogleSheetForm } from "@/components/platform/own-google-sheet-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { supabaseConnectors } from "@/platform/db/schema";
import { getServiceAccountEmail, isGoogleSheetsConfigured } from "@/tenant/storage/google-auth";
import { SupabaseDataSection } from "./supabase-data-section";

/**
 * TENANT data plane.
 * A · Google Sheets (create for me)
 * B · Your own Google Cloud / sheet
 * C · Your own Supabase + we never host customer DB
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
  const saEmail = getServiceAccountEmail();

  return (
    <PageShell maxWidth="md" className="py-6 pb-12">
      <p className="premium-label">Your business · data</p>
      <h1 className="premium-heading mt-1 text-xl">Data</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Where <strong>customer</strong> orders and bookings are stored. You choose the storage. We never
        keep client PII in the ALINKS platform database.
      </p>

      <div className="mt-2 rounded-xl border border-brand-ink/10 bg-brand-mist/40 px-3 py-2 text-[12px] text-brand-muted">
        Active backend:{" "}
        <strong className="text-brand-ink">
          {backend === "supabase"
            ? "Supabase (yours)"
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
        />

        <OwnGoogleSheetForm
          businessId={business.id}
          spreadsheetId={business.googleSpreadsheetId ?? ""}
          serviceAccountEmail={saEmail}
        />

        <SupabaseDataSection
          businessId={business.id}
          projectUrl={connector?.projectUrl ?? ""}
          connected={Boolean(connector?.isActive && backend === "supabase")}
          storageBackend={backend}
        />
      </div>
    </PageShell>
  );
}
