import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import Link from "next/link";

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

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <main className="mx-auto max-w-app px-3.5 py-5 pb-10">
        <h1 className="t-ink text-lg font-bold tracking-tight">Shop</h1>
        <p className="t-muted mt-0.5 text-xs leading-snug">
          {proCheckout
            ? "Add items to cart and checkout"
            : "Tap Order — we’ll open WhatsApp with your request"}
        </p>
        <StoreCatalog business={business} products={products} proCheckout={proCheckout} />
        {(business.vertical === "salon" || business.vertical === "beauty") && (
          <Link href={`/${params.handle}/book`} className="t-link mt-5 inline-block text-xs font-semibold">
            Book a package
          </Link>
        )}
        <PublicSiteNav
          handle={params.handle}
          vertical={business.vertical}
          slug="home"
          path="store"
        />
      </main>
      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
    </TenantThemedLayout>
  );
}
