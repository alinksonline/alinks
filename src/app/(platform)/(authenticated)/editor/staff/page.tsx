import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { getStaffForBusiness } from "@/app/actions/staff";
import { canShowStaffEditor } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { StaffForm } from "./staff-form";

/** Staff / trainer / doctor roster. */
export default async function StaffEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowStaffEditor({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    redirect("/editor");
  }

  const staff = await getStaffForBusiness(business.id);
  const isClinic = business.vertical === "clinic" || business.industryType === "clinic";
  const isFitness = business.industryGroup === "fitness";

  return (
    <>
      <EditorNav
        active="/editor/staff"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">
          {isClinic ? "Doctors & slots" : isFitness ? "Trainers" : "Staff & slots"}
        </h1>
        <p className="mt-2 text-sm text-brand-ink/55">
          {isClinic
            ? "Doctor roster with per-person slot capacity."
            : isFitness
              ? "Trainer roster with slot capacity for classes and PT."
              : "Stylists and beauty staff with per-person slot capacity."}
        </p>
        <StaffForm businessId={business.id} staff={staff} variant={isFitness ? "fitness" : "default"} />
      </PageShell>
    </>
  );
}
