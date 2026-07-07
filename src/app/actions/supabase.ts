"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, supabaseConnectors } from "@/platform/db/schema";

export async function connectSupabaseAction(businessId: string, projectUrl: string, anonKey: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const keyRef = crypto.createHash("sha256").update(anonKey).digest("hex").slice(0, 16);
    const existing = await db.select().from(supabaseConnectors).where(eq(supabaseConnectors.businessId, businessId)).limit(1);

    if (existing[0]) {
      await db
        .update(supabaseConnectors)
        .set({ projectUrl: projectUrl.trim(), anonKeyRef: keyRef, isActive: true })
        .where(eq(supabaseConnectors.id, existing[0].id));
    } else {
      await db.insert(supabaseConnectors).values({
        businessId,
        projectUrl: projectUrl.trim(),
        anonKeyRef: keyRef,
      });
    }

    await db
      .update(businesses)
      .set({ storageBackend: "supabase", updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    revalidatePath("/dashboard/integrations/supabase");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}