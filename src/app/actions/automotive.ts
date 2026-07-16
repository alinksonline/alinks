"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, vehicleListings } from "@/platform/db/schema";
import { writeToTenantStorage } from "@/tenant/storage/write-service";

export type VehicleCondition = "new" | "used" | "two_wheeler";
export type VehicleVisibility = "open" | "teaser" | "private";

export async function getPublicVehiclesForHandle(handle: string) {
  const db = getPlatformDb();
  if (!db) return [];
  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz || !biz.isPublished) return [];

  const rows = await db
    .select()
    .from(vehicleListings)
    .where(and(eq(vehicleListings.businessId, biz.id), eq(vehicleListings.isActive, true)))
    .orderBy(asc(vehicleListings.sortOrder), asc(vehicleListings.title));

  return rows
    .filter((r) => r.visibility !== "private")
    .map((r) => ({
      ...r,
      priceLabel: r.visibility === "teaser" ? "Price on request" : r.priceLabel,
      description:
        r.visibility === "teaser" && r.description && r.description.length > 100
          ? r.description.slice(0, 100) + "…"
          : r.description,
    }));
}

export async function getVehiclesForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db
    .select()
    .from(vehicleListings)
    .where(eq(vehicleListings.businessId, businessId))
    .orderBy(asc(vehicleListings.sortOrder), asc(vehicleListings.title));
}

export async function addVehicleListingAction(input: {
  businessId: string;
  title: string;
  condition: VehicleCondition;
  visibility: VehicleVisibility;
  make?: string;
  model?: string;
  year?: number;
  priceLabel?: string;
  city?: string;
  description?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const title = input.title.trim();
    if (title.length < 3) return { success: false as const, error: "Title required" };

    await db.insert(vehicleListings).values({
      businessId: input.businessId,
      title,
      condition: input.condition,
      visibility: input.visibility,
      make: input.make?.trim() || null,
      model: input.model?.trim() || null,
      year: input.year ?? null,
      priceLabel: input.priceLabel?.trim() || null,
      city: input.city?.trim() || null,
      description: input.description?.trim() || null,
      isActive: true,
      sortOrder: 50,
    });

    revalidatePath("/editor/vehicles");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateVehicleListingAction(input: {
  businessId: string;
  listingId: string;
  isActive?: boolean;
  visibility?: VehicleVisibility;
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
        .from(vehicleListings)
        .where(
          and(
            eq(vehicleListings.id, input.listingId),
            eq(vehicleListings.businessId, input.businessId),
          ),
        )
        .limit(1)
    )[0];
    if (!row) return { success: false as const, error: "Not found" };

    await db
      .update(vehicleListings)
      .set({
        isActive: input.isActive ?? row.isActive,
        visibility: input.visibility ?? row.visibility,
        updatedAt: new Date(),
      })
      .where(eq(vehicleListings.id, input.listingId));

    revalidatePath("/editor/vehicles");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteVehicleListingAction(businessId: string, listingId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };
    await db
      .delete(vehicleListings)
      .where(and(eq(vehicleListings.id, listingId), eq(vehicleListings.businessId, businessId)));
    revalidatePath("/editor/vehicles");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Buy / test-drive interest → tenant Sheets. Never car checkout. */
export async function submitVehicleLeadAction(input: {
  handle: string;
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  phone: string;
  message?: string;
  intent?: "buy" | "test_drive" | "service";
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const biz = (
      await db.select().from(businesses).where(eq(businesses.handle, input.handle)).limit(1)
    )[0];
    if (!biz || !biz.isPublished) return { success: false as const, error: "Not found" };

    const name = input.name.trim();
    const phone = input.phone.replace(/\D/g, "").slice(0, 15);
    if (name.length < 2 || phone.length < 10) {
      return { success: false as const, error: "Name and 10-digit phone required" };
    }

    await writeToTenantStorage(biz.id, "Customers", {
      leadType: "automotive",
      intent: input.intent ?? "buy",
      vehicleId: input.vehicleId ?? "",
      vehicleTitle: input.vehicleTitle ?? "",
      customerName: name,
      customerPhone: phone,
      message: input.message?.trim() ?? "",
      channel: "web",
      createdAt: new Date().toISOString(),
    });

    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
