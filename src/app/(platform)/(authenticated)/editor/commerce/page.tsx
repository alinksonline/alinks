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

export default async function CommerceEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0] : null;
  const storage = await resolveStorageBackend(business.id);

  return (
    <>
      <EditorNav active="/editor/commerce" />
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-xl font-bold">Commerce</h1>
        <p className="mt-2 text-sm text-slate-600">
          Lite WhatsApp catalog or Pro cart checkout. Orders append to your Google Sheet (not ALINKS database).
        </p>
        <div className="mt-6">
          <CommerceForm
            businessId={business.id}
            spreadsheetId={business.googleSpreadsheetId ?? ""}
            checkoutMode={business.checkoutMode}
            codEnabled={business.codEnabled}
            tier={tenant?.tier ?? "basic"}
            storageKind={storage.kind}
            googleConfigured={isGoogleSheetsConfigured()}
            serviceAccountEmail={getServiceAccountEmail()}
          />
        </div>
      </PageShell>
    </>
  );
}