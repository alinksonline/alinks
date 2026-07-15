import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { salonPackages } from "@/platform/db/schema";
import { PackagesPanel } from "./packages-panel";

/** Pay-then-book packages — salon & beauty only. */
export default async function PackagesEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (business.vertical !== "salon" && business.vertical !== "beauty") {
    redirect("/editor");
  }

  const db = getPlatformDb();
  const packages = db
    ? await db.select().from(salonPackages).where(eq(salonPackages.businessId, business.id))
    : [];

  return (
    <>
      <EditorNav active="/editor/packages" vertical={business.vertical} />
      <PageShell className="py-4">
        <p className="premium-label">Your shop</p>
        <h1 className="premium-heading mt-1 text-lg">Packages</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          This is what customers buy on your salon site (pay-then-book). Payment methods (UPI, card, COD)
          are under <strong>Pay</strong> — not here.
        </p>
        <PackagesPanel businessId={business.id} packages={packages} />
      </PageShell>
    </>
  );
}
