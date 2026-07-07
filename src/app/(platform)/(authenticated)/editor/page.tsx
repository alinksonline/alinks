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
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-2xl font-bold text-slate-900">Website builder</h1>
        <p className="mt-1 text-sm text-slate-500">
          {business.name} · /{business.handle} · max 5 pages
        </p>
        <ul className="mt-6 space-y-2">
          {pageList.map((p) => (
            <li key={p.id}>
              <Link
                href={`/editor/pages/${p.slug}`}
                className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 hover:border-slate-400"
              >
                <span className="font-medium">{p.title}</span>
                <span className={`text-xs font-bold uppercase ${p.isPublished ? "text-emerald-600" : "text-slate-400"}`}>
                  {p.isPublished ? "Live" : "Draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {!business.isPublished && (
          <p className="mt-6 text-sm text-amber-700">
            Site is draft — complete the <Link href="/editor/publish" className="underline">publish checklist</Link>.
          </p>
        )}
      </PageShell>
    </>
  );
}