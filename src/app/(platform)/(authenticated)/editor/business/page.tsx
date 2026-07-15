import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { parseBusinessProfile } from "@/core/types/business-profile";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { BusinessProfileForm } from "./business-profile-form";

export default async function BusinessProfilePage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const profile = parseBusinessProfile(business.branding, business.name);

  return (
    <>
      <EditorNav active="/editor/business" vertical={business.vertical} />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Business profile</h1>
        <p className="mt-1 text-xs text-brand-ink/45">
          Name, email, phone, WhatsApp & social handles — used across your whole site
        </p>
        <div className="mt-4">
          <BusinessProfileForm businessId={business.id} initial={profile} />
        </div>
      </PageShell>
    </>
  );
}
