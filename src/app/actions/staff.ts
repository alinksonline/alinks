"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { staffMembers } from "@/platform/db/schema";

export async function addStaffMemberAction(businessId: string, name: string, role: string, slotCapacity: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.insert(staffMembers).values({ businessId, name: name.trim(), role, slotCapacity });
    revalidatePath("/editor/staff");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getStaffForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db.select().from(staffMembers).where(eq(staffMembers.businessId, businessId));
}