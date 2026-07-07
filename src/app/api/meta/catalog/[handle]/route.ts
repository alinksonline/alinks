import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { getCatalogByHandle } from "@/tenant/storage/catalog";
import { getEnv } from "@/core/config/env";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const db = getPlatformDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const biz = (await db.select().from(businesses).where(eq(businesses.handle, params.handle)).limit(1))[0];
  if (!biz || !biz.isPublished || !biz.metaCatalogEnabled) {
    return NextResponse.json({ error: "Catalog not enabled" }, { status: 404 });
  }

  const products = await getCatalogByHandle(params.handle);
  const env = getEnv();
  const base = `${env.NEXT_PUBLIC_APP_URL}/${params.handle}/store`;

  const feed = products.map((p) => ({
    id: p.id,
    title: p.name,
    description: p.name,
    availability: "in stock",
    condition: "new",
    price: `${p.price} INR`,
    link: base,
    image_link: p.imageUrl ?? "",
    brand: biz.name,
  }));

  return NextResponse.json({ data: feed });
}