import Link from "next/link";
import { eq } from "drizzle-orm";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { pages } from "@/platform/db/schema";

export default async function EditorHomePage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  const pageList = db ? await db.select().from(pages).where(eq(pages.businessId, business.id)) : [];

  return (
    <>
      <EditorNav active="/editor" vertical={business.vertical} industryGroup={business.industryGroup} />
      <PageShell className="py-3">
        <h1 className="text-base font-bold tracking-tight text-brand-ink">Website builder</h1>
        <p className="mt-0.5 text-[11px] leading-snug text-brand-muted">
          {business.name} · /{business.handle} · max 5 pages
        </p>
        <Link
          href="/editor/business"
          className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-brand-purple/25 bg-brand-purple/10 px-3 py-2 active:scale-[0.99]"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-brand-ink">Business profile</span>
            <span className="block text-[10px] text-brand-muted">Name, phone, WhatsApp, social</span>
          </span>
          <span className="shrink-0 text-sm text-brand-purple">→</span>
        </Link>
        <ul className="mt-3 space-y-1.5">
          {pageList.map((p) => (
            <li key={p.id}>
              <Link href={`/editor/pages/${p.slug}`} className="ui-row active:scale-[0.99]">
                <span className="min-w-0 truncate text-xs font-semibold text-brand-ink">{p.title}</span>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${
                    p.isPublished ? "text-emerald-600 dark:text-emerald-400" : "text-brand-muted"
                  }`}
                >
                  {p.isPublished ? "Live" : "Draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {business.isPublished ? (
          <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] leading-snug text-emerald-900 dark:text-emerald-100">
            <span className="font-bold">Published 100%</span> — live at{" "}
            <Link href={`/${business.handle}`} className="font-mono font-semibold underline">
              /{business.handle}
            </Link>
            .{" "}
            <Link href="/editor/publish" className="font-semibold underline">
              Republish / Unpublish
            </Link>
          </p>
        ) : (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-snug text-amber-900 dark:text-amber-100">
            Site is private —{" "}
            <Link href="/editor/publish" className="font-semibold underline">
              Go live
            </Link>{" "}
            when ready.
          </p>
        )}
      </PageShell>
    </>
  );
}
