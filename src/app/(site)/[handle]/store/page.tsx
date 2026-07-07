import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { StoreCatalog } from "@/components/tenant/store-catalog";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { canUseProCheckout } from "@/core/utils/tier-gates";
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
  const business: Business = row;
  const proCheckout = canUseProCheckout(business.tier, business.checkoutMode ?? "lite");

  return (
    <>
      <SiteHeader business={business} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">
          {proCheckout ? "Pro checkout — cart, UPI, card & COD" : "Commerce Lite — WhatsApp orders"}
        </p>
        <StoreCatalog business={business} products={products} proCheckout={proCheckout} />
        {(business.vertical === "salon" || business.vertical === "beauty") && (
          <Link href={`/${params.handle}/book`} className="mt-6 inline-block text-sm font-semibold text-pink-700 underline">
            Book a salon package
          </Link>
        )}
        <Link href={`/${params.handle}`} className="mt-4 block text-sm underline">
          Back to site
        </Link>
      </main>
      <TenantFooter business={business} showAlinksBranding={shouldShowAlinksWatermark(business.tier)} />
    </>
  );
}