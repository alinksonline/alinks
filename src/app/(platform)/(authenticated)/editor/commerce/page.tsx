import { eq } from "drizzle-orm";
import { EditorNav } from "@/components/editor/editor-nav";
import { CommerceForm } from "./commerce-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";

export default async function CommerceEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0] : null;

  return (
    <>
      <EditorNav active="/editor/commerce" />
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-xl font-bold">Commerce</h1>
        <p className="mt-2 text-sm text-slate-600">Lite WhatsApp catalog or Pro cart checkout with sheet order writes.</p>
        <div className="mt-6">
          <CommerceForm
            businessId={business.id}
            spreadsheetId={business.googleSpreadsheetId ?? "dev-sheet-demo"}
            checkoutMode={business.checkoutMode}
            codEnabled={business.codEnabled}
            tier={tenant?.tier ?? "basic"}
          />
        </div>
      </PageShell>
    </>
  );
}