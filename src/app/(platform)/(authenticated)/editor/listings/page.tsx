import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { canShowPropertyBank } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getListingsForBusiness } from "@/app/actions/real-estate";
import { ListingsEditorPanel } from "./listings-editor-panel";

export default async function ListingsEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowPropertyBank({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    redirect("/editor");
  }

  const listings = await getListingsForBusiness(business.id);

  return (
    <>
      <EditorNav
        active="/editor/listings"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4 pb-10">
        <p className="premium-label">Property-Bank</p>
        <h1 className="premium-heading mt-1 text-lg">Listings</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          Sell / resale / rent / lease. Visibility: open · teaser · private. No title checkout or escrow on
          ALINKS.
        </p>
        <ListingsEditorPanel businessId={business.id} handle={business.handle} listings={listings} />
      </PageShell>
    </>
  );
}
