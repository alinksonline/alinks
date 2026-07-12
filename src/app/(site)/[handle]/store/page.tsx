import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { StoreCatalog } from "@/components/tenant/store-catalog";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { canUseProCheckout } from "@/core/utils/tier-gates";
import { parseBusinessProfile } from "@/core/types/business-profile";
import type { Business } from "@/core/types/tenant";
import { getPublicBusinessByHandle } from "@/tenant/site/get-public-business";
import { getCatalogByHandle } from "@/tenant/storage/catalog";

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const business = await getPublicBusinessByHandle(params.handle);
  if (!business) return { title: "Store" };
  return {
    title: `${business.name} — Store`,
    description: `Shop ${business.name} on ALINKS`,
    openGraph: { title: `${business.name} Store`, type: "website" },
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
      <main className="mx-auto max-w-app px-3.5 py-6">
        <h1 className="t-ink text-lg font-bold">Catalog</h1>
        <p className="t-muted mt-0.5 text-xs">
          {proCheckout ? "Pro checkout — cart, UPI, card & COD" : "Commerce Lite — WhatsApp orders"}
        </p>
        <StoreCatalog business={business} products={products} proCheckout={proCheckout} />
        {(business.vertical === "salon" || business.vertical === "beauty") && (
          <Link href={`/${params.handle}/book`} className="t-link mt-5 inline-block text-xs font-semibold">
            Book a salon package
          </Link>
        )}
        <Link href={`/${params.handle}`} className="t-link mt-3 block text-xs">
          Back to site
        </Link>
      </main>
      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
    </TenantThemedLayout>
  );
}
