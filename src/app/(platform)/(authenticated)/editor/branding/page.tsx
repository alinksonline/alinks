import { EditorNav } from "@/components/editor/editor-nav";
import { BrandingForm } from "./branding-form";
import { PageShell } from "@/components/shared/page-shell";
import { parseBusinessProfile } from "@/core/types/business-profile";
import type { BrandingConfig } from "@/core/types/page";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";

export default async function BrandingEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const profile = parseBusinessProfile(business.branding, business.name);
  const branding: BrandingConfig = {
    businessName: profile.businessName,
    tagline: profile.tagline,
    logoUrl: profile.logoUrl,
    faviconUrl: profile.faviconUrl,
    coverUrl: profile.coverUrl,
    ogImageUrl: profile.ogImageUrl,
    ogFallback: profile.ogFallback,
    showTitleWithLogo: profile.showTitleWithLogo,
    email: profile.email,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    address: profile.address,
    socials: profile.socials,
  };

  return (
    <>
      <EditorNav active="/editor/branding" vertical={business.vertical} industryGroup={business.industryGroup} />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Branding</h1>
        <p className="mt-1 text-[12px] leading-snug text-brand-muted">
          Logo, cover, favicon/app icon, and WhatsApp link previews (OG).
        </p>
        <div className="mt-6">
          <BrandingForm businessId={business.id} initial={branding} />
        </div>
      </PageShell>
    </>
  );
}