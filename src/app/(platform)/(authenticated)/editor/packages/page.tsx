import { eq } from "drizzle-orm";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { salonPackages } from "@/platform/db/schema";
import { PackagesPanel } from "./packages-panel";

export default async function PackagesEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const packages = db
    ? await db.select().from(salonPackages).where(eq(salonPackages.businessId, business.id))
    : [];

  return (
    <>
      <EditorNav active="/editor/packages" />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Salon packages</h1>
        <p className="mt-2 text-sm text-brand-ink/55">12 pre-made templates for pay-then-book.</p>
        <PackagesPanel businessId={business.id} packages={packages} />
      </PageShell>
    </>
  );
}
