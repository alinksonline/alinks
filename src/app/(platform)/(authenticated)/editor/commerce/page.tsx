import { eq } from "drizzle-orm";
import { EditorNav } from "@/components/editor/editor-nav";
import { CommerceForm } from "./commerce-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { getServiceAccountEmail, isGoogleSheetsConfigured } from "@/tenant/storage/google-auth";
import { resolveStorageBackend } from "@/tenant/storage/get-adapter";

/**
 * Payments & checkout setup — not product catalog.
 * Salon catalog of services = /editor/packages.
 * Kirana product catalog = future Shop tab.
 */
export default async function CommerceEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const storage = await resolveStorageBackend(business.id);
  const isSalon = business.vertical === "salon" || business.vertical === "beauty";

  return (
    <>
      <EditorNav active="/editor/commerce" vertical={business.vertical} />
      <PageShell className="py-3 pb-10">
        <p className="premium-label">Payments</p>
        <h1 className="premium-heading mt-1 text-lg">How customers pay you</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          {isSalon
            ? "Checkout, COD, and your orders sheet. What you sell lives under Packages — not here."
            : "Checkout, COD, and your orders sheet. Enable UPI / card when you’re on Pro."}
        </p>
        <div className="mt-5">
          <CommerceForm
            businessId={business.id}
            spreadsheetId={business.googleSpreadsheetId ?? ""}
            checkoutMode={business.checkoutMode}
            codEnabled={business.codEnabled}
            tier={tenant?.tier ?? "basic"}
            storageKind={storage.kind}
            googleConfigured={isGoogleSheetsConfigured()}
            serviceAccountEmail={getServiceAccountEmail()}
            vertical={business.vertical}
          />
        </div>
      </PageShell>
    </>
  );
}
