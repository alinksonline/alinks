import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/tenant/site-header";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantThemedLayout } from "@/components/tenant/tenant-themed-layout";
import { shouldShowAlinksWatermark } from "@/core/utils/branding";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { getPublicBusinessByDomain } from "@/tenant/site/get-public-business";

export default async function CustomDomainSitePage() {
  const host = headers().get("x-forwarded-host") ?? headers().get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "");
  const row = await getPublicBusinessByDomain(hostname);

  if (!row) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Custom domain not configured</h1>
        <p className="mt-2 max-w-md text-slate-600">
          {hostname} is not linked to a published ALINKS business yet. Custom domain wizard ships in Phase 2.
        </p>
      </main>
    );
  }

  if (!row.isPublished) notFound();

  const profile = parseBusinessProfile(row.branding, row.name);
  const business = { ...row, profile };

  return (
    <TenantThemedLayout theme={business.theme}>
      <SiteHeader business={business} profile={profile} />
      <main className="mx-auto max-w-app px-3.5 py-12 text-center">
        <h1 className="t-ink text-2xl font-black tracking-tight">{business.name}</h1>
        <p className="t-muted mt-3 text-sm">Served via custom domain — {hostname}</p>
      </main>
      <TenantFooter
        business={business}
        profile={profile}
        showAlinksBranding={shouldShowAlinksWatermark(business.tier)}
      />
    </TenantThemedLayout>
  );
}
