import Link from "next/link";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { evaluatePublishGate } from "@/platform/legal/publish-gate";
import { PublishForm } from "./publish-form";

export default async function PublishPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  // UI pre-check: do NOT require TENANT_TOS/PRIVACY yet — those are created by the confirm checkbox.
  const preGate = await evaluatePublishGate(session.userId, { requireTenantLegalLogged: false });

  return (
    <>
      <EditorNav active="/editor/publish" />
      <PageShell className="py-4">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">Go live</h1>
        <p className="mt-1 text-xs leading-relaxed text-brand-ink/50">
          Make your site public at{" "}
          <span className="font-mono font-semibold text-brand-ink/70">/{business.handle}</span>
        </p>

        <div className="mt-4 space-y-3">
          <Link
            href="/editor/business"
            className="flex min-h-12 items-center justify-between rounded-2xl border border-brand-ink/10 bg-white px-4 py-3 active:scale-[0.99]"
          >
            <span className="text-sm font-semibold text-brand-ink">Business profile</span>
            <span className="text-xs text-brand-ink/40">Name · phone · WA →</span>
          </Link>
          <Link
            href="/editor/pages/legal"
            className="flex min-h-12 items-center justify-between rounded-2xl border border-brand-ink/10 bg-white px-4 py-3 active:scale-[0.99]"
          >
            <span className="text-sm font-semibold text-brand-ink">Legal page</span>
            <span className="text-xs text-brand-ink/40">Terms & privacy text →</span>
          </Link>
        </div>

        <div className="mt-6">
          <PublishForm
            businessId={business.id}
            handle={business.handle}
            isPublished={business.isPublished}
            canPublish={preGate.ok}
            blockers={preGate.blockers}
          />
        </div>
      </PageShell>
    </>
  );
}
