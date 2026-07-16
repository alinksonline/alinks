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
      <EditorNav active="/editor/publish" vertical={business.vertical} industryGroup={business.industryGroup} />
      <PageShell className="py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base font-bold tracking-tight text-brand-ink">
              {business.isPublished ? "Site status" : "Go live"}
            </h1>
            <p className="mt-0.5 text-[11px] leading-relaxed text-brand-muted">
              {business.isPublished ? (
                <>
                  Live at{" "}
                  <span className="font-mono font-semibold text-brand-ink">/{business.handle}</span>
                </>
              ) : (
                <>
                  Make your site public at{" "}
                  <span className="font-mono font-semibold text-brand-ink">/{business.handle}</span>
                </>
              )}
            </p>
          </div>
          {business.isPublished ? (
            <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              100%
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
              Draft
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <Link href="/editor/business" className="ui-row active:scale-[0.99]">
            <span className="text-xs font-semibold text-brand-ink">Business profile</span>
            <span className="text-[11px] text-brand-muted">Name · phone · WA →</span>
          </Link>
          <Link href="/editor/pages/legal" className="ui-row active:scale-[0.99]">
            <span className="text-xs font-semibold text-brand-ink">Legal page</span>
            <span className="text-[11px] text-brand-muted">Terms & privacy text →</span>
          </Link>
        </div>

        <div className="mt-4">
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
