import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { getStaffForBusiness } from "@/app/actions/staff";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { StaffForm } from "./staff-form";

/** Staff roster / slots — salon, beauty, clinic. */
export default async function StaffEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    business.vertical !== "salon" &&
    business.vertical !== "beauty" &&
    business.vertical !== "clinic"
  ) {
    redirect("/editor");
  }

  const staff = await getStaffForBusiness(business.id);
  const isClinic = business.vertical === "clinic";

  return (
    <>
      <EditorNav active="/editor/staff" vertical={business.vertical} />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">
          {isClinic ? "Doctors & slots" : "Staff & slots"}
        </h1>
        <p className="mt-2 text-sm text-brand-ink/55">
          {isClinic
            ? "Doctor roster with per-person slot capacity."
            : "Stylists and beauty staff with per-person slot capacity."}
        </p>
        <StaffForm businessId={business.id} staff={staff} />
      </PageShell>
    </>
  );
}
