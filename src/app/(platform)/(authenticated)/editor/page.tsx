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
      <EditorNav active="/editor" />
      <PageShell className="py-5">
        <h1 className="text-xl font-bold tracking-tight text-brand-ink">Website builder</h1>
        <p className="mt-1 text-sm leading-snug text-brand-ink/55">
          {business.name} · /{business.handle} · Linktree-style stack · max 5 pages
        </p>
        <ul className="mt-5 space-y-2.5">
          {pageList.map((p) => (
            <li key={p.id}>
              <Link
                href={`/editor/pages/${p.slug}`}
                className="flex min-h-[3.5rem] items-center justify-between gap-3 rounded-2xl border border-brand-ink/10 bg-brand-surface px-4 py-3.5 shadow-card active:scale-[0.99]"
              >
                <span className="min-w-0 truncate font-semibold text-brand-ink">{p.title}</span>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${
                    p.isPublished ? "text-emerald-600" : "text-brand-ink/35"
                  }`}
                >
                  {p.isPublished ? "Live" : "Draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {!business.isPublished && (
          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Site is draft — complete the{" "}
            <Link href="/editor/publish" className="font-semibold underline">
              publish checklist
            </Link>
            .
          </p>
        )}
      </PageShell>
    </>
  );
}