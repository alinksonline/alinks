import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { LinktreeStackEditor } from "@/components/editor/linktree-stack-editor";
import { PageShell } from "@/components/shared/page-shell";
import { parseBusinessProfile } from "@/core/types/business-profile";
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
  const accentColor = theme?.accentColor ?? "#7c3aed";
  const profile = parseBusinessProfile(business.branding, business.name);

  return (
    <>
      <EditorNav active="/editor" />
      <PageShell className="px-3 py-3">
        <LinktreeStackEditor
          businessId={business.id}
          slug={params.slug}
          handle={business.handle}
          businessName={profile.businessName || business.name}
          primaryColor={primaryColor}
          accentColor={accentColor}
          initialContent={content}
          isPublished={row.isPublished}
          businessIsPublished={business.isPublished}
          profile={profile}
        />
      </PageShell>
    </>
  );
}
