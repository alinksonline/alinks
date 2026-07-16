"use server";

import { and, asc, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TIER_LIMITS } from "@/core/constants/limits";
import type { SubscriptionTier } from "@/core/config/tiers";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, storeProducts, tenants } from "@/platform/db/schema";
import {
  KIRANA_PRODUCT_TEMPLATES,
  RETAIL_PRODUCT_TEMPLATES,
} from "@/tenant/retail/product-templates";

export async function getStoreProductsForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db
    .select()
    .from(storeProducts)
    .where(eq(storeProducts.businessId, businessId))
    .orderBy(asc(storeProducts.sortOrder), asc(storeProducts.name));
}

export async function seedRetailProductsAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const existing = await db
      .select()
      .from(storeProducts)
      .where(eq(storeProducts.businessId, businessId))
      .limit(1);
    if (existing.length > 0) return { success: true as const, seeded: false };

    const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
    const templates =
      biz?.industryType === "kirana" || biz?.vertical === "kirana" || biz?.vertical === "grocery"
        ? KIRANA_PRODUCT_TEMPLATES
        : RETAIL_PRODUCT_TEMPLATES;

    await db.insert(storeProducts).values(
      templates.map((t) => ({
        businessId,
        name: t.name,
        description: t.description,
        price: t.price,
        mrp: t.mrp ?? null,
        category: t.category,
        brand: t.brand ?? null,
        sku: t.sku,
        stock: t.stock,
        sortOrder: t.sortOrder,
        isActive: true,
      })),
    );

    revalidatePath("/editor/products");
    if (biz?.handle) revalidatePath(`/${biz.handle}/store`);
    return { success: true as const, seeded: true };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Seed failed" };
  }
}

export async function addStoreProductAction(input: {
  businessId: string;
  name: string;
  price: number;
  category: string;
  brand?: string;
  description?: string;
  mrp?: number;
  stock?: number;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const name = input.name.trim();
    if (name.length < 2) return { success: false as const, error: "Name required" };

    const tenant = (
      await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1)
    )[0];
    const tier = (tenant?.tier ?? "basic") as SubscriptionTier;
    const cap = TIER_LIMITS[tier].products;
    const [{ value: productCount }] = await db
      .select({ value: count() })
      .from(storeProducts)
      .where(eq(storeProducts.businessId, input.businessId));

    if (productCount >= cap) {
      return {
        success: false as const,
        error: `Your plan allows ${cap} products. Upgrade to add more.`,
      };
    }

    await db.insert(storeProducts).values({
      businessId: input.businessId,
      name,
      description: input.description?.trim() || null,
      price: Math.max(0, Math.round(input.price)),
      mrp: input.mrp != null ? Math.round(input.mrp) : null,
      category: input.category.trim() || "General",
      brand: input.brand?.trim() || null,
      stock: input.stock ?? null,
      isActive: true,
      sortOrder: 100,
    });

    revalidatePath("/editor/products");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateStoreProductAction(input: {
  businessId: string;
  productId: string;
  isActive?: boolean;
  price?: number;
  name?: string;
  stock?: number | null;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const row = (
      await db
        .select()
        .from(storeProducts)
        .where(
          and(eq(storeProducts.id, input.productId), eq(storeProducts.businessId, input.businessId)),
        )
        .limit(1)
    )[0];
    if (!row) return { success: false as const, error: "Product not found" };

    await db
      .update(storeProducts)
      .set({
        isActive: input.isActive ?? row.isActive,
        price: input.price ?? row.price,
        name: input.name?.trim() || row.name,
        stock: input.stock === undefined ? row.stock : input.stock,
        updatedAt: new Date(),
      })
      .where(eq(storeProducts.id, input.productId));

    revalidatePath("/editor/products");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteStoreProductAction(businessId: string, productId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .delete(storeProducts)
      .where(and(eq(storeProducts.id, productId), eq(storeProducts.businessId, businessId)));

    revalidatePath("/editor/products");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateTradeModeAction(
  businessId: string,
  tradeMode: "retail" | "wholesale" | "both",
) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    // MVP: only retail storefront is fully built; wholesale/both stored for later
    if (tradeMode !== "retail" && tradeMode !== "wholesale" && tradeMode !== "both") {
      return { success: false as const, error: "Invalid trade mode" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(businesses)
      .set({ tradeMode, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    revalidatePath("/editor/products");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
