import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { canShowVehicleListings } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getVehiclesForBusiness } from "@/app/actions/automotive";
import { VehiclesEditorPanel } from "./vehicles-editor-panel";

export default async function VehiclesEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowVehicleListings({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
      industryType: business.industryType,
    })
  ) {
    redirect("/editor");
  }

  const vehicles = await getVehiclesForBusiness(business.id);

  return (
    <>
      <EditorNav
        active="/editor/vehicles"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4 pb-10">
        <p className="premium-label">Automotive</p>
        <h1 className="premium-heading mt-1 text-lg">Vehicles</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          Showcase inventory + leads. Visibility: open · teaser · private.{" "}
          <strong>No car checkout</strong> on ALINKS — deals close offline.
        </p>
        <VehiclesEditorPanel businessId={business.id} handle={business.handle} vehicles={vehicles} />
      </PageShell>
    </>
  );
}
