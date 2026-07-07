import { EditorNav } from "@/components/editor/editor-nav";
import { BrandingForm } from "./branding-form";
import { PageShell } from "@/components/shared/page-shell";
import type { BrandingConfig } from "@/core/types/page";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";

export default async function BrandingEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const branding = (business.branding as BrandingConfig) ?? {
    businessName: business.name,
    logoUrl: "",
    faviconUrl: "",
    coverUrl: "",
  };

  return (
    <>
      <EditorNav active="/editor/branding" />
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-xl font-bold">Branding</h1>
        <div className="mt-6">
          <BrandingForm businessId={business.id} initial={branding} />
        </div>
      </PageShell>
    </>
  );
}