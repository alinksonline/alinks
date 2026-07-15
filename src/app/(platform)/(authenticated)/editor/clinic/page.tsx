import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { ClinicForm } from "./clinic-form";

/** NMC / medical license gate — clinic vertical only (not salon/beauty). */
export default async function ClinicEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (business.vertical !== "clinic") {
    redirect("/editor");
  }

  return (
    <>
      <EditorNav active="/editor/clinic" vertical={business.vertical} />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Clinic license</h1>
        <p className="mt-2 text-sm text-brand-ink/55">
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
