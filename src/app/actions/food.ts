"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canEnableFoodModule, resolveFoodType } from "@/core/config/food-compat";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, menuItems } from "@/platform/db/schema";
import { CATERING_MENU_TEMPLATES, FOOD_MENU_TEMPLATES } from "@/tenant/food/menu-templates";

export async function getMenuItemsForHandle(handle: string) {
  const db = getPlatformDb();
  if (!db) return [];
  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz) return [];
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.businessId, biz.id), eq(menuItems.isAvailable, true)))
    .orderBy(asc(menuItems.sortOrder), asc(menuItems.name));
}

export async function getMenuItemsForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.businessId, businessId))
    .orderBy(asc(menuItems.sortOrder), asc(menuItems.name));
}

export async function seedFoodMenuAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const existing = await db.select().from(menuItems).where(eq(menuItems.businessId, businessId)).limit(1);
    if (existing.length > 0) return { success: true as const, seeded: false };

    const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
    const foodType = resolveFoodType(biz?.industryType, biz?.vertical);
    const templates =
      foodType === "catering_only" ? CATERING_MENU_TEMPLATES : FOOD_MENU_TEMPLATES;

    await db.insert(menuItems).values(
      templates.map((t) => ({
        businessId,
        name: t.name,
        description: t.description,
        section: t.section,
        price: t.price,
        isVeg: t.isVeg,
        sortOrder: t.sortOrder,
        isAvailable: true,
      })),
    );

    revalidatePath("/editor/menu");
    if (biz?.handle) revalidatePath(`/${biz.handle}/menu`);
    return { success: true as const, seeded: true };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Seed failed" };
  }
}

export async function addMenuItemAction(input: {
  businessId: string;
  name: string;
  description?: string;
  section: string;
  price: number;
  isVeg: boolean;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const name = input.name.trim();
    if (name.length < 2) return { success: false as const, error: "Name required" };

    await db.insert(menuItems).values({
      businessId: input.businessId,
      name,
      description: input.description?.trim() || null,
      section: input.section.trim() || "Mains",
      price: Math.max(0, Math.round(input.price)),
      isVeg: input.isVeg,
      isAvailable: true,
      sortOrder: 100,
    });

    revalidatePath("/editor/menu");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateMenuItemAction(input: {
  businessId: string;
  itemId: string;
  isAvailable?: boolean;
  price?: number;
  name?: string;
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
        .from(menuItems)
        .where(and(eq(menuItems.id, input.itemId), eq(menuItems.businessId, input.businessId)))
        .limit(1)
    )[0];
    if (!row) return { success: false as const, error: "Item not found" };

    await db
      .update(menuItems)
      .set({
        isAvailable: input.isAvailable ?? row.isAvailable,
        price: input.price ?? row.price,
        name: input.name?.trim() || row.name,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, input.itemId));

    revalidatePath("/editor/menu");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteMenuItemAction(businessId: string, itemId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .delete(menuItems)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.businessId, businessId)));

    revalidatePath("/editor/menu");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Hard gate: refuse food.dine_in for cloud types. */
export async function assertFoodModuleAllowed(businessId: string, moduleSku: string) {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");
  const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
  if (!biz) throw new Error("Business not found");
  const type = resolveFoodType(biz.industryType, biz.vertical);
  if (!canEnableFoodModule(type, moduleSku)) {
    throw new Error(
      "Cloud kitchen and cloud+catering cannot enable Restaurant Dine-in (no tables / table QR).",
    );
  }
}
