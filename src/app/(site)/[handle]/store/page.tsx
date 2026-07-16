import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { StoreCatalog } from "@/components/tenant/store-catalog";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { canUseProCheckout } from "@/core/utils/tier-gates";
import { parseBusinessProfile } from "@/core/types/business-profile";
import type { Business } from "@/core/types/tenant";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";
import { getCatalogByHandle } from "@/tenant/storage/catalog";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Shop" };
  const { buildTenantMetadata } = await import("@/core/utils/tenant-seo");
  return buildTenantMetadata({
    handle: params.handle,
    name: business.name,
    branding: business.branding,
    title: `${business.name} — Shop`,
    description: `Order from ${business.name} on ALINKS`,
    path: `/${params.handle}/store`,
  });
}

export default async function StorePage({ params }: { params: { handle: string } }) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  // Food Layer 1 uses /menu (WhatsApp), not retail store cart
  const { resolveIndustryGroup } = await import("@/core/config/industries");
  const group = resolveIndustryGroup(row.industryGroup || row.vertical);
  if (group === "food" || row.vertical === "restaurant") {
    const { redirect } = await import("next/navigation");
    redirect(`/${params.handle}/menu`);
  }

  // Presence and non-commerce industries: no storefront
  const { canExposeStorefront } = await import("@/core/utils/industry-gates");
  const { listEntitledSkus } = await import("@/platform/billing/entitlements");
  const entitledSkus = await listEntitledSkus(row.id);
  if (
    !canExposeStorefront({
      vertical: row.vertical,
      industryGroup: row.industryGroup,
      industryType: row.industryType,
      entitledSkus,
    })
  ) {
    notFound();
  }

  const products = await getCatalogByHandle(params.handle);
  const profile = parseBusinessProfile(row.branding, row.name);
  const business: Business = { ...row, profile };
  const proCheckout = canUseProCheckout(business.tier, business.checkoutMode ?? "lite");
  const isSalon = business.vertical === "salon" || business.vertical === "beauty";
  const tradeMode = (row as { tradeMode?: string }).tradeMode ?? "retail";
  const brands = new Set(products.map((p) => p.brand).filter(Boolean));

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          Storefront
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">Shop</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          {proCheckout
            ? "Add items to cart — checkout with UPI, card, or COD (money goes to the shop)."
            : "Browse products and order on WhatsApp. No multi-outlet POS — one online shop."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="t-chip t-chip-active">{products.length} products</span>
          {brands.size > 0 ? <span className="t-chip">{brands.size} brands</span> : null}
          <span className="t-chip">{proCheckout ? "Cart + COD" : "WhatsApp order"}</span>
        </div>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-4 pb-4">
        <StoreCatalog
          business={business}
          products={products}
          proCheckout={proCheckout}
          tradeMode={tradeMode}
        />
        {isSalon ? (
          <div className="mt-6 text-center">
            <Link
              href={`/${params.handle}/book`}
              className="t-btn-primary mx-auto !w-auto !px-6"
            >
              Book a package instead
            </Link>
          </div>
        ) : null}
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
      <PublicSiteNav
        handle={params.handle}
        vertical={business.vertical}
        industryGroup={business.industryGroup}
        slug="home"
        path="store"
      />
    </TenantThemedLayout>
  );
}
