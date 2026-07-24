"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, propertyListings } from "@/platform/db/schema";
import { writeToTenantStorage } from "@/tenant/storage/write-service";

export type ListingType = "sell" | "resale" | "rent" | "lease";
export type ListingVisibility = "open" | "teaser" | "private";

export async function getPublicListingsForHandle(handle: string) {
  const db = getPlatformDb();
  if (!db) return [];
  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz || !biz.isPublished) return [];

  const rows = await db
    .select()
    .from(propertyListings)
    .where(and(eq(propertyListings.businessId, biz.id), eq(propertyListings.isActive, true)))
    .orderBy(asc(propertyListings.sortOrder), asc(propertyListings.title));

  // private never on public site; teaser hides price detail
  return rows
    .filter((r) => r.visibility !== "private")
    .map((r) => ({
      ...r,
      priceLabel: r.visibility === "teaser" ? "Price on request" : r.priceLabel,
      description:
        r.visibility === "teaser"
          ? (r.description?.slice(0, 80) ?? "") + (r.description && r.description.length > 80 ? "…" : "")
          : r.description,
    }));
}

export async function getListingsForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db
    .select()
    .from(propertyListings)
    .where(eq(propertyListings.businessId, businessId))
    .orderBy(asc(propertyListings.sortOrder), asc(propertyListings.title));
}

export async function addPropertyListingAction(input: {
  businessId: string;
  title: string;
  listingType: ListingType;
  visibility: ListingVisibility;
  city?: string;
  locality?: string;
  priceLabel?: string;
  bedrooms?: number;
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

    await db.insert(propertyListings).values({
      businessId: input.businessId,
      title,
      listingType: input.listingType,
      visibility: input.visibility,
      city: input.city?.trim() || null,
      locality: input.locality?.trim() || null,
      priceLabel: input.priceLabel?.trim() || null,
      bedrooms: input.bedrooms ?? null,
      description: input.description?.trim() || null,
      isActive: true,
      sortOrder: 50,
    });

    revalidatePath("/editor/listings");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updatePropertyListingAction(input: {
  businessId: string;
  listingId: string;
  isActive?: boolean;
  visibility?: ListingVisibility;
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
        .from(propertyListings)
        .where(
          and(
            eq(propertyListings.id, input.listingId),
            eq(propertyListings.businessId, input.businessId),
          ),
        )
        .limit(1)
    )[0];
    if (!row) return { success: false as const, error: "Not found" };

    await db
      .update(propertyListings)
      .set({
        isActive: input.isActive ?? row.isActive,
        visibility: input.visibility ?? row.visibility,
        updatedAt: new Date(),
      })
      .where(eq(propertyListings.id, input.listingId));

    revalidatePath("/editor/listings");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deletePropertyListingAction(businessId: string, listingId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };
    await db
      .delete(propertyListings)
      .where(and(eq(propertyListings.id, listingId), eq(propertyListings.businessId, businessId)));
    revalidatePath("/editor/listings");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Lead → tenant Sheets (Customers / Activity). No platform PII retention. */
export async function submitPropertyLeadAction(input: {
  handle: string;
  listingId?: string;
  listingTitle?: string;
  name: string;
  phone: string;
  message?: string;
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

    await writeToTenantStorage(biz.id, "Leads", {
      leadId: crypto.randomUUID(),
      leadType: "property",
      source: "web",
      refId: input.listingId ?? "",
      refTitle: input.listingTitle ?? "",
      name,
      phone,
      message: input.message?.trim() ?? "",
      status: "new",
      createdAt: new Date().toISOString(),
    });

    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
