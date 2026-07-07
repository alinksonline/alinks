import type { CatalogProduct } from "@/core/types/commerce";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { getStorageAdapter } from "./get-adapter";

const FALLBACK_PRODUCTS: CatalogProduct[] = [
  { id: "1", name: "Premium Service", price: 999, category: "services" },
  { id: "2", name: "Basic Package", price: 499, category: "services" },
  { id: "3", name: "Consultation", price: 299, category: "services" },
];

export async function getCatalogForBusiness(businessId: string): Promise<CatalogProduct[]> {
  const adapter = await getStorageAdapter(businessId);
  const rows = await adapter.readRows("Products");
  if (rows.length === 0) return FALLBACK_PRODUCTS;

  return rows.map((row, i) => ({
    id: String(row.id ?? i + 1),
    name: String(row.name ?? "Product"),
    price: Number(row.price ?? 0),
    mrp: row.mrp ? Number(row.mrp) : undefined,
    imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
    category: row.category ? String(row.category) : undefined,
    stock: row.stock ? Number(row.stock) : undefined,
    sku: row.sku ? String(row.sku) : undefined,
  }));
}

export async function getCatalogByHandle(handle: string): Promise<CatalogProduct[]> {
  const db = getPlatformDb();
  if (!db) return FALLBACK_PRODUCTS;

  const row = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!row) return FALLBACK_PRODUCTS;
  return getCatalogForBusiness(row.id);
}

export async function seedCatalogProducts(businessId: string, products: CatalogProduct[]): Promise<void> {
  const adapter = await getStorageAdapter(businessId);
  const existing = await adapter.readRows("Products");
  if (existing.length > 0) return;
  for (const p of products) {
    await adapter.appendRow("Products", {
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp ?? p.price,
      category: p.category ?? "general",
      stock: p.stock ?? 100,
      sku: p.sku ?? p.id,
    });
  }
}