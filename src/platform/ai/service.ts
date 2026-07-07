import { and, eq, sql } from "drizzle-orm";
import { getEnv } from "@/core/config/env";
import { AI_TIER_LIMITS, type AiTaskType } from "@/core/config/ai-limits";
import type { SubscriptionTier } from "@/core/config/tiers";
import { getPlatformDb } from "@/platform/db/client";
import { aiUsage, tenants } from "@/platform/db/schema";

function monthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getAiUsageCount(tenantId: string, taskType: AiTaskType): Promise<number> {
  const db = getPlatformDb();
  if (!db) return 0;
  const row = (
    await db
      .select()
      .from(aiUsage)
      .where(and(eq(aiUsage.tenantId, tenantId), eq(aiUsage.monthKey, monthKey()), eq(aiUsage.taskType, taskType)))
      .limit(1)
  )[0];
  return row?.count ?? 0;
}

export async function checkAiQuota(tenantId: string, taskType: AiTaskType): Promise<{ ok: boolean; reason?: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, reason: "Database not connected" };

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0];
  if (!tenant) return { ok: false, reason: "Tenant not found" };

  const tier = tenant.tier as SubscriptionTier;
  const limit = AI_TIER_LIMITS[tier][taskType];
  if (limit === undefined) return { ok: false, reason: "Task not included in tier" };

  const used = await getAiUsageCount(tenantId, taskType);
  if (used < limit) return { ok: true };
  if (tenant.aiCredits > 0) return { ok: true };

  return { ok: false, reason: "Monthly AI cap reached — buy credit packs" };
}

async function incrementUsage(tenantId: string, taskType: AiTaskType, useCredits: boolean) {
  const db = getPlatformDb();
  if (!db) return;

  if (useCredits) {
    await db
      .update(tenants)
      .set({ aiCredits: sql`GREATEST(${tenants.aiCredits} - 1, 0)` })
      .where(eq(tenants.id, tenantId));
    return;
  }

  const key = monthKey();
  const existing = (
    await db
      .select()
      .from(aiUsage)
      .where(and(eq(aiUsage.tenantId, tenantId), eq(aiUsage.monthKey, key), eq(aiUsage.taskType, taskType)))
      .limit(1)
  )[0];

  if (existing) {
    await db.update(aiUsage).set({ count: existing.count + 1, updatedAt: new Date() }).where(eq(aiUsage.id, existing.id));
  } else {
    await db.insert(aiUsage).values({ tenantId, monthKey: key, taskType, count: 1 });
  }
}

export async function generateAiContent(input: {
  tenantId: string;
  taskType: AiTaskType;
  prompt: string;
  context?: Record<string, string>;
}): Promise<{ ok: true; result: string } | { ok: false; error: string }> {
  const quota = await checkAiQuota(input.tenantId, input.taskType);
  if (!quota.ok) return { ok: false, error: quota.reason ?? "Quota exceeded" };

  const env = getEnv();
  let result: string;

  if (env.OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: input.prompt }],
          max_tokens: 400,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        result = data.choices?.[0]?.message?.content ?? "";
      } else {
        result = buildMockResult(input);
      }
    } catch {
      result = buildMockResult(input);
    }
  } else {
    result = buildMockResult(input);
  }

  const db = getPlatformDb();
  const tenant = db ? (await db.select().from(tenants).where(eq(tenants.id, input.tenantId)).limit(1))[0] : null;
  const tier = (tenant?.tier ?? "basic") as SubscriptionTier;
  const limit = AI_TIER_LIMITS[tier][input.taskType] ?? 0;
  const used = await getAiUsageCount(input.tenantId, input.taskType);
  const useCredits = used >= limit && (tenant?.aiCredits ?? 0) > 0;

  await incrementUsage(input.tenantId, input.taskType, useCredits);
  return { ok: true, result: result.trim() };
}

function buildMockResult(input: { taskType: AiTaskType; prompt: string; context?: Record<string, string> }): string {
  const name = input.context?.businessName ?? "your business";
  const city = input.context?.city ?? "your city";
  switch (input.taskType) {
    case "seo_meta":
      return `Title: ${name} — Best ${input.context?.vertical ?? "services"} in ${city}\nDescription: Visit ${name} for trusted local service. Book online or call today.`;
    case "bulk_product":
      return `Premium quality product from ${name}. Fresh, reliable, and great value for ${city} customers.`;
    case "share_caption":
      return `Check out ${name}! Great deals near you. Shop now.`;
    default:
      return `ALINKS AI draft: ${input.prompt.slice(0, 120)}… Review before publishing.`;
  }
}