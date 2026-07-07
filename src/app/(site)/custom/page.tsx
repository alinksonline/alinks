import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { getPublicBusinessByDomain } from "@/tenant/site/get-public-business";

export default async function CustomDomainSitePage() {
  const host = headers().get("x-forwarded-host") ?? headers().get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "");
  const business = await getPublicBusinessByDomain(hostname);

  if (!business) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Custom domain not configured</h1>
        <p className="mt-2 max-w-md text-slate-600">
          {hostname} is not linked to a published ALINKS business yet. Custom domain wizard ships in Phase 2.
        </p>
      </main>
    );
  }

  if (!business.isPublished) notFound();

  return (
    <>
      <SiteHeader business={business} />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{business.name}</h1>
        <p className="mt-4 text-slate-600">Served via custom domain — {hostname}</p>
      </main>
      <TenantFooter business={business} showAlinksBranding={shouldShowAlinksWatermark(business.tier)} />
    </>
  );
}