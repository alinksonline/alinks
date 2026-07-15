import { eq } from "drizzle-orm";
import { EditorNav } from "@/components/editor/editor-nav";
import { CommerceForm } from "./commerce-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { getTenantGatewayStatus } from "@/platform/payments/tenant-gateway";

/**
 * Tenant Checkout — connect YOUR Razorpay + COD.
 * ALINKS does not facilitate/settle shop sales.
 */
export default async function CommerceEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const tenant = db
    ? (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0]
    : null;
  const gateway = await getTenantGatewayStatus(business.id);
  const isSalon = business.vertical === "salon" || business.vertical === "beauty";

  return (
    <>
      <EditorNav active="/editor/commerce" vertical={business.vertical} />
      <PageShell className="py-3 pb-10">
        <p className="premium-label">Your site · customers</p>
        <h1 className="premium-heading mt-1 text-lg">Checkout</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          {isSalon
            ? "Connect your Razorpay and COD. Sales money goes to you — not ALINKS."
            : "Connect your Razorpay and COD. Customer payments settle to your gateway."}
        </p>
        <div className="mt-5">
          <CommerceForm
            businessId={business.id}
            spreadsheetId={business.googleSpreadsheetId ?? ""}
            checkoutMode={business.checkoutMode}
            codEnabled={business.codEnabled}
            tier={tenant?.tier ?? "basic"}
            vertical={business.vertical}
            razorpayConnected={gateway.connected}
            razorpayKeyId={gateway.keyId}
          />
        </div>
      </PageShell>
    </>
  );
}
