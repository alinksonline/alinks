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
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Salon packages</h1>
        <p className="mt-2 text-sm text-brand-ink/55">
          Pre-made packages for pay-then-book — customers pay, then pick a slot.
        </p>
        <PackagesPanel businessId={business.id} packages={packages} />
      </PageShell>
    </>
  );
}
