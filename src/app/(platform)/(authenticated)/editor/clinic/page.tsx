import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { ClinicForm } from "./clinic-form";

export default async function ClinicEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  return (
    <>
      <EditorNav active="/editor/clinic" />
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-xl font-bold">Clinic license</h1>
        <p className="mt-2 text-sm text-slate-600">
          Submit NMC registration for superadmin review before clinic booking goes live.
        </p>
        <p className="mt-1 text-sm">
          Gate status: <strong>{business.verticalGateStatus}</strong>
        </p>
        <ClinicForm businessId={business.id} />
      </PageShell>
    </>
  );
}