import type { PageContent } from "@/core/types/page";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, pages, tenants } from "@/platform/db/schema";
import { eq, and } from "drizzle-orm";
import type { SubscriptionTier } from "@/core/config/tiers";

export interface PublicPageData {
  slug: string;
  title: string;
  content: PageContent;
  business: {
    id: string;
    handle: string;
    name: string;
    vertical: string;
    tier: SubscriptionTier;
    theme: Record<string, unknown>;
    branding: Record<string, unknown>;
  };
}

export async function getPublicPage(handle: string, slug: string): Promise<PublicPageData | null> {
  const db = getPlatformDb();
  if (!db) return null;

  const rows = await db
    .select({ business: businesses, tier: tenants.tier })
    .from(businesses)
    .innerJoin(tenants, eq(businesses.tenantId, tenants.id))
    .where(eq(businesses.handle, handle))
    .limit(1);

  const row = rows[0];
  if (!row || !row.business.isPublished) return null;

  const pageRows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.businessId, row.business.id), eq(pages.slug, slug)))
    .limit(1);

  const page = pageRows[0];
  if (!page || !page.isPublished) return null;

  return {
    slug: page.slug,
    title: page.title,
    content: page.content as PageContent,
    business: {
      id: row.business.id,
      handle: row.business.handle,
      name: row.business.name,
      vertical: row.business.vertical,
      tier: row.tier as SubscriptionTier,
      theme: (row.business.theme as Record<string, unknown>) ?? {},
      branding: (row.business.branding as Record<string, unknown>) ?? {},
    },
  };
}