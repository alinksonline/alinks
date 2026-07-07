import { eq } from "drizzle-orm";
import { getEnv } from "@/core/config/env";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, pages } from "@/platform/db/schema";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const db = getPlatformDb();
  if (!db) return new Response("Not found", { status: 404 });

  const biz = (await db.select().from(businesses).where(eq(businesses.handle, params.handle)).limit(1))[0];
  if (!biz || !biz.isPublished) return new Response("Not found", { status: 404 });

  const env = getEnv();
  const base = `${env.NEXT_PUBLIC_APP_URL}/${params.handle}`;
  const slugs = await db.select().from(pages).where(eq(pages.businessId, biz.id));

  const urls = [
    base,
    `${base}/store`,
    `${base}/book`,
    ...slugs.filter((p) => p.isPublished).map((p) => `${base}/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
