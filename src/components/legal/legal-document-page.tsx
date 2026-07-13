import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import type { PlatformLegalDocument } from "@/platform/legal/platform-documents";

type LegalDocumentPageProps = {
  document: PlatformLegalDocument;
};

export function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  return (
    <PageShell maxWidth="md" className="py-8 pb-16 sm:py-12">
      <div className="mb-6">
        <Link
          href="/signup"
          className="text-xs font-semibold text-brand-turquoise-light transition-colors hover:text-brand-turquoise"
        >
          ← Back to signup
        </Link>
      </div>
      <LegalDocumentBody document={document} />
      <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-zinc-400">
        By using ALINKS you may be asked to accept this document during signup or before publishing.
      </div>
    </PageShell>
  );
}