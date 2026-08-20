import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { StoreCatalog } from "@/components/tenant/store-catalog";
import { PublicSiteNav } from "@/components/tenant/public-site-nav";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { catalogKindOf, catalogTitle, type CatalogKind } from "@/core/utils/catalog-kind";
import {
  catalogModeShowsProducts,
  catalogModeShowsServices,
  normalizeCatalogMode,
} from "@/core/utils/catalog-mode";
import { canUseProCheckout } from "@/core/utils/tier-gates";
import { parseBusinessProfile } from "@/core/types/business-profile";
import type { Business } from "@/core/types/tenant";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";
import { getCatalogByHandle } from "@/tenant/storage/catalog";

export async function CatalogKindPage({
  handle,
  kind,
}: {
  handle: string;
  kind: CatalogKind;
}) {
  const row = await getPublicBusinessByHandle(handle);
  if (!row) notFound();

  const { resolveIndustryGroup } = await import("@/core/config/industries");
  const group = resolveIndustryGroup(row.industryGroup || row.vertical);
  if (group === "food" || row.vertical === "restaurant") {
    const { redirect } = await import("next/navigation");
    redirect(`/${handle}/menu`);
  }

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

  const catalogMode = normalizeCatalogMode(row.catalogMode);
  if (kind === "physical" && !catalogModeShowsProducts(catalogMode)) notFound();
  if (kind === "service" && !catalogModeShowsServices(catalogMode)) notFound();

  const all = await getCatalogByHandle(handle);
  const products = all.filter((p) => catalogKindOf(p) === kind);
  const otherCount =
    kind === "physical"
      ? catalogModeShowsServices(catalogMode)
        ? all.length - products.length
        : 0
      : catalogModeShowsProducts(catalogMode)
        ? all.length - products.length
        : 0;
  const profile = parseBusinessProfile(row.branding, row.name);
  const business: Business = { ...row, profile };
  const proCheckout = canUseProCheckout(business.tier, business.checkoutMode ?? "lite");
  const tradeMode = row.tradeMode ?? "retail";
  const title = catalogTitle(kind);
  const otherHref = kind === "physical" ? `/${handle}/service-shop` : `/${handle}/products`;
  const otherLabel = kind === "physical" ? "Services" : "Products";
  const path = kind === "physical" ? "products" : "service-shop";

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--t-primary-text, var(--t-primary))" }}
        >
          {title}
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          {kind === "physical"
            ? "Physical items. Delivery address is required at checkout."
            : "Services. Address is required only if the shop comes to you."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherCount > 0 ? (
            <Link href={otherHref} className="t-chip">
              {otherLabel} →
            </Link>
          ) : null}
          <Link href={`/${handle}/account`} className="t-chip">
            My account
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-4 pb-4">
        <StoreCatalog
          business={business}
          products={products}
          proCheckout={proCheckout}
          tradeMode={tradeMode}
        />
      </main>

      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier, business.entitledSkus)}
      />
      <PublicSiteNav
        handle={handle}
        vertical={business.vertical}
        industryGroup={business.industryGroup}
        slug="home"
        path={path}
        catalogMode={catalogMode}
      />
    </TenantThemedLayout>
  );
}
