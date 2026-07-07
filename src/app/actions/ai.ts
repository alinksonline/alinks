"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { AI_CREDIT_PACKS } from "@/core/config/ai-limits";
import type { AiTaskType } from "@/core/config/ai-limits";
import { getSession } from "@/platform/auth/session";
import { generateAiContent, getAiUsageCount } from "@/platform/ai/service";
import { getPlatformDb } from "@/platform/db/client";
import { tenants } from "@/platform/db/schema";
import { recordLegalAcceptance } from "@/platform/legal/acceptances";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";

export async function generateContentAction(input: {
  taskType: AiTaskType;
  prompt: string;
  businessName?: string;
  vertical?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.AI_CONTENT_REVIEW });

  const result = await generateAiContent({
    tenantId: session.userId,
    taskType: input.taskType,
    prompt: input.prompt,
    context: { businessName: input.businessName ?? "", vertical: input.vertical ?? "" },
  });

  if (!result.ok) return { success: false as const, error: result.error };
  revalidatePath("/dashboard/ai");
  return { success: true as const, result: result.result };
}

export async function getAiDashboardStats() {
  const session = await getSession();
  if (!session) return null;

  const db = getPlatformDb();
  if (!db) return null;

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
  if (!tenant) return null;

  const fieldUsed = await getAiUsageCount(session.userId, "field_generate");
  const seoUsed = await getAiUsageCount(session.userId, "seo_meta");

  return { tier: tenant.tier, aiCredits: tenant.aiCredits, fieldUsed, seoUsed, packs: AI_CREDIT_PACKS };
}

export async function purchaseCreditPackAction(packId: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const pack = AI_CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return { success: false as const, error: "Invalid pack" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  await db
    .update(tenants)
    .set({ aiCredits: sql`${tenants.aiCredits} + ${pack.credits}` })
    .where(eq(tenants.id, session.userId));

  revalidatePath("/dashboard/ai");
  return { success: true as const, credits: pack.credits };
}
