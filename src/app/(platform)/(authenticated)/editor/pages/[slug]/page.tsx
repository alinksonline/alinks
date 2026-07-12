import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { LinktreeStackEditor } from "@/components/editor/linktree-stack-editor";
import { PageShell } from "@/components/shared/page-shell";
import type { PageContent, ThemeConfig } from "@/core/types/page";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { pages } from "@/platform/db/schema";

export default async function EditorPageSlug({ params }: { params: { slug: string } }) {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const db = getPlatformDb();
  if (!db) {
    return (
      <PageShell className="py-8">
        <p className="text-sm text-amber-800">Database not connected. Try again in a moment.</p>
      </PageShell>
    );
  }

  let row: (typeof pages.$inferSelect) | undefined;
  try {
    row = (
      await db
        .select()
        .from(pages)
        .where(and(eq(pages.businessId, business.id), eq(pages.slug, params.slug)))
        .limit(1)
    )[0];
  } catch {
    return (
      <PageShell className="py-8">
        <p className="text-sm text-amber-800">Could not load this page (database busy). Try again.</p>
      </PageShell>
    );
  }

  if (!row) notFound();

  const content = (row.content as PageContent | null) ?? { blocks: [] };
  if (!Array.isArray(content.blocks)) content.blocks = [];

  const theme = (business.theme as ThemeConfig | null) ?? null;
  const primaryColor = theme?.primaryColor ?? business.themePrimary ?? "#5b21b6";

  return (
    <>
      <EditorNav active="/editor" />
      <PageShell className="py-3">
        <h1 className="text-lg font-bold tracking-tight text-brand-ink">{row.title}</h1>
        <p className="mt-0.5 text-xs text-brand-ink/45">
          Linktree-style stack · same editor on every page · mobile only
        </p>
        <div className="mt-3">
          <LinktreeStackEditor
            businessId={business.id}
            slug={params.slug}
            handle={business.handle}
            businessName={business.name}
            primaryColor={primaryColor}
            initialContent={content}
            isPublished={row.isPublished}
          />
        </div>
      </PageShell>
    </>
  );
}
