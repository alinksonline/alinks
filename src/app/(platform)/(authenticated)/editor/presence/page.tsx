import Link from "next/link";
import { eq } from "drizzle-orm";
import { PageShell } from "@/components/shared/page-shell";
import { isPresenceIndustry, resolveIndustryGroup } from "@/core/config/industries";
import { defaultPresenceExtras } from "@/core/types/presence-extras";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { hasModule } from "@/platform/billing/entitlements";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { PresenceEditorPanel } from "./presence-editor-panel";

export default async function PresenceEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const row = db
    ? (
        await db.select().from(businesses).where(eq(businesses.id, business.id)).limit(1)
      )[0]
    : null;

  const group = resolveIndustryGroup(row?.industryGroup || row?.vertical || "general");
  if (!isPresenceIndustry(group)) {
    return (
      <PageShell className="py-6">
        <h1 className="premium-heading text-lg">Presence studio</h1>
        <p className="premium-subtext mt-2">
          This editor is for Presence / profile industries.{" "}
          <Link href="/billing" className="text-brand-turquoise">
            Switch industry
          </Link>{" "}
          if you only need a link hub.
        </p>
      </PageShell>
    );
  }

  const branding = (row?.branding as Record<string, unknown>) ?? {};
  const extras = defaultPresenceExtras(branding.presenceExtras);
  const flags = {
    mediaKit: await hasModule(business.id, "pr.media_kit"),
    socialProof: await hasModule(business.id, "pr.social_proof"),
    highlights: await hasModule(business.id, "pr.highlights"),
  };

  return (
    <PageShell className="py-6 pb-10">
      <p className="premium-label">Editor</p>
      <h1 className="premium-heading mt-1 text-lg">Presence studio</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Media kit, social proof, and highlights — display only, no shop. Enable modules under Billing →
        Select modules if locked.
      </p>
      <PresenceEditorPanel businessId={business.id} initial={extras} flags={flags} />
      <p className="mt-6 text-xs text-brand-muted">
        <Link href="/billing" className="font-semibold text-brand-turquoise">
          Select modules
        </Link>
        {" · "}
        <Link href="/dashboard/creator-partner" className="font-semibold text-brand-turquoise">
          Creator Partner
        </Link>
      </p>
    </PageShell>
  );
}
