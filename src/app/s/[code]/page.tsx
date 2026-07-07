import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getPlatformDb } from "@/platform/db/client";
import { shareLinks } from "@/platform/db/schema";

export default async function ShortLinkPage({ params }: { params: { code: string } }) {
  const db = getPlatformDb();
  if (!db) redirect("/");

  const link = (await db.select().from(shareLinks).where(eq(shareLinks.code, params.code)).limit(1))[0];
  if (!link) redirect("/");

  await db
    .update(shareLinks)
    .set({ clicks: sql`${shareLinks.clicks} + 1` })
    .where(eq(shareLinks.id, link.id));

  redirect(link.targetUrl);
}