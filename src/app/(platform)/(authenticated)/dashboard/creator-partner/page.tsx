import Link from "next/link";
import { eq } from "drizzle-orm";
import { PageShell } from "@/components/shared/page-shell";
import { defaultPresenceExtras } from "@/core/types/presence-extras";
import { CREATOR_PARTNER_TIERS } from "@/core/config/industries";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { CreatorPartnerPanel } from "./creator-partner-panel";

export default async function CreatorPartnerPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const row = db
    ? (
        await db.select().from(businesses).where(eq(businesses.id, business.id)).limit(1)
      )[0]
    : null;

  const tier = row?.creatorPartnerTier ?? null;
  const tierDef = tier && tier in CREATOR_PARTNER_TIERS
    ? CREATOR_PARTNER_TIERS[tier as keyof typeof CREATOR_PARTNER_TIERS]
    : null;
  const branding = (row?.branding as Record<string, unknown>) ?? {};
  const extras = defaultPresenceExtras(branding.presenceExtras);

  return (
    <PageShell className="py-6 pb-10">
      <p className="premium-label">Creator Partner</p>
      <h1 className="premium-heading mt-1 text-lg">Partner duties</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Deep Creator pricing is a trade: keep an ALINKS mention and complete light promo duties. Mark posts
        here so we can keep your discount fair.
      </p>

      {!tier ? (
        <div className="premium-card mt-5 px-4 py-4 text-sm text-brand-muted">
          This business is not on Creator Partner. Choose Influencer + accept Partner terms at onboarding,
          or contact support.{" "}
          <Link href="/billing" className="font-semibold text-brand-turquoise">
            Billing
          </Link>
        </div>
      ) : (
        <CreatorPartnerPanel
          businessId={business.id}
          tier={tier}
          tierLabel={tierDef?.label ?? tier}
          acceptedAt={row?.creatorPartnerAcceptedAt?.toISOString() ?? null}
          promo={extras.partnerPromo}
          handle={business.handle}
        />
      )}

      <p className="mt-6 text-xs text-brand-muted">
        <Link href="/dashboard" className="font-semibold text-brand-turquoise">
          ← Dashboard
        </Link>
        {" · "}
        <Link href="/editor/presence" className="font-semibold text-brand-turquoise">
          Media kit & highlights
        </Link>
      </p>
    </PageShell>
  );
}
