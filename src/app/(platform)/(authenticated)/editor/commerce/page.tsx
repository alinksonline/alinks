import { eq } from "drizzle-orm";
import { EditorNav } from "@/components/editor/editor-nav";
import { CommerceForm } from "./commerce-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";

/**
 * TENANT Checkout — how customers pay the shop.
 * Orders Google Sheet → Settings.
 * ALINKS subscription → Billing.
 */
export default async function CommerceEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const isSalon = business.vertical === "salon" || business.vertical === "beauty";

  return (
    <>
      <EditorNav active="/editor/commerce" vertical={business.vertical} />
      <PageShell className="py-3 pb-10">
        <p className="premium-label">Your site · customers</p>
        <h1 className="premium-heading mt-1 text-lg">Checkout</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          {isSalon
            ? "How shoppers pay for packages (UPI, card, COD)."
            : "How shoppers pay on your mini-site (UPI, card, COD)."}
        </p>
        <div className="mt-5">
          <CommerceForm
            businessId={business.id}
            spreadsheetId={business.googleSpreadsheetId ?? ""}
            checkoutMode={business.checkoutMode}
            codEnabled={business.codEnabled}
            tier={tenant?.tier ?? "basic"}
            vertical={business.vertical}
          />
        </div>
      </PageShell>
    </>
  );
}
