import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { getStaffForBusiness } from "@/app/actions/staff";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { StaffForm } from "./staff-form";

export default async function StaffEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const staff = await getStaffForBusiness(business.id);

  return (
    <>
      <EditorNav active="/editor/staff" />
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-xl font-bold">Staff & slots</h1>
        <p className="mt-2 text-sm text-slate-600">Salon and beauty staff with per-person slot capacity.</p>
        <StaffForm businessId={business.id} staff={staff} />
      </PageShell>
    </>
  );
}