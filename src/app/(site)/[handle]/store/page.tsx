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
  return {
    title: `${business.name} — Shop`,
    description: `Order from ${business.name} on ALINKS`,
    openGraph: { title: `${business.name} Shop`, type: "website" },
  };
}

export default async function StorePage({ params }: { params: { handle: string } }) {
  const row = await getPublicBusinessByHandle(params.handle);
  if (!row) notFound();

  const products = await getCatalogByHandle(params.handle);
  const profile = parseBusinessProfile(row.branding, row.name);
  const business: Business = { ...row, profile };
  const proCheckout = canUseProCheckout(business.tier, business.checkoutMode ?? "lite");
  const isSalon = business.vertical === "salon" || business.vertical === "beauty";

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />

      <section className="t-page-hero">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--t-primary)" }}>
          Catalog
        </p>
        <h1 className="t-ink mt-1.5 text-2xl font-bold tracking-tight">Shop</h1>
        <p className="t-muted mt-1.5 max-w-sm text-sm leading-relaxed">
          {proCheckout
            ? "Add items to your cart and checkout with UPI, card, or COD."
            : "Tap order — we open WhatsApp with your request ready to send."}
        </p>
      </section>

      <main className="mx-auto max-w-app px-3.5 py-4 pb-4">
        <StoreCatalog business={business} products={products} proCheckout={proCheckout} />
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
      <PublicSiteNav handle={params.handle} vertical={business.vertical} slug="home" path="store" />
    </TenantThemedLayout>
  );
}
