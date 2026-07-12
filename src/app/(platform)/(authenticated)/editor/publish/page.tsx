import { EditorNav } from "@/components/editor/editor-nav";
import { PublishForm } from "./publish-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { evaluatePublishGate } from "@/platform/legal/publish-gate";

export default async function PublishPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const gate = await evaluatePublishGate(session.userId);

  return (
    <>
      <EditorNav active="/editor/publish" />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Publish checklist</h1>
        <p className="mt-2 text-sm text-brand-ink/55">Q019 — all gates must pass before your site goes public.</p>
        {gate.blockers.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-amber-800">
            {gate.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        <div className="mt-6">
          <PublishForm businessId={business.id} isPublished={business.isPublished} gateOk={gate.ok} />
        </div>
      </PageShell>
    </>
  );
}