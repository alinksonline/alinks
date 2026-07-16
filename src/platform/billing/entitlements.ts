import { and, eq } from "drizzle-orm";
import {
  getIndustryDef,
  resolveIndustryGroup,
  type IndustryGroup,
} from "@/core/config/industries";
import { getModule, modulesForIndustry, type ModuleDef } from "@/core/config/modules";
import { getPlatformDb } from "@/platform/db/client";
import {
  industrySettings,
  modulePriceOverrides,
  tenantModuleEntitlements,
} from "@/platform/db/schema";

export type EntitlementRow = {
  sku: string;
  enabled: boolean;
  source: string;
};

/** Active module SKUs for a business (enabled only). */
export async function listEntitledSkus(businessId: string): Promise<string[]> {
  const db = getPlatformDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(tenantModuleEntitlements)
    .where(
      and(eq(tenantModuleEntitlements.businessId, businessId), eq(tenantModuleEntitlements.enabled, true)),
    );

  return rows.map((r) => r.sku);
}

export async function hasModule(businessId: string, sku: string): Promise<boolean> {
  const skus = await listEntitledSkus(businessId);
  return skus.includes(sku);
}

/** Grant default free/included modules for an industry (onboarding). */
export async function grantDefaultModules(
  businessId: string,
  industryGroup: IndustryGroup | string,
  source = "onboarding",
): Promise<string[]> {
  const db = getPlatformDb();
  if (!db) return [];

  const def = getIndustryDef(industryGroup);
  const skus = [...def.flags.defaultModuleSkus];

  // Also grant any catalog modules marked includedInWebsite for this industry.
  for (const m of modulesForIndustry(def.group)) {
    if (m.includedInWebsite && m.enabled && !skus.includes(m.sku)) {
      skus.push(m.sku);
    }
  }

  for (const sku of skus) {
    const existing = await db
      .select()
      .from(tenantModuleEntitlements)
      .where(
        and(eq(tenantModuleEntitlements.businessId, businessId), eq(tenantModuleEntitlements.sku, sku)),
      )
      .limit(1);

    if (existing[0]) {
      if (!existing[0].enabled) {
        await db
          .update(tenantModuleEntitlements)
          .set({ enabled: true, updatedAt: new Date() })
          .where(eq(tenantModuleEntitlements.id, existing[0].id));
      }
      continue;
    }

    await db.insert(tenantModuleEntitlements).values({
      businessId,
      sku,
      enabled: true,
      source,
    });
  }

  return skus;
}

export async function setModuleEntitlement(
  businessId: string,
  sku: string,
  enabled: boolean,
  source = "superadmin",
): Promise<void> {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  const existing = await db
    .select()
    .from(tenantModuleEntitlements)
    .where(
      and(eq(tenantModuleEntitlements.businessId, businessId), eq(tenantModuleEntitlements.sku, sku)),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(tenantModuleEntitlements)
      .set({ enabled, source, updatedAt: new Date() })
      .where(eq(tenantModuleEntitlements.id, existing[0].id));
    return;
  }

  await db.insert(tenantModuleEntitlements).values({
    businessId,
    sku,
    enabled,
    source,
  });
}

export type EffectiveModule = ModuleDef & {
  effectiveMonthly: number;
  effectiveYearly: number;
  overrideEnabled: boolean;
};

/** Catalog merged with Superadmin price overrides. */
export async function getEffectiveModuleCatalog(group?: IndustryGroup | string): Promise<EffectiveModule[]> {
  const db = getPlatformDb();
  const overrides = db ? await db.select().from(modulePriceOverrides) : [];
  const bySku = new Map(overrides.map((o) => [o.sku, o]));

  const base = group ? modulesForIndustry(group) : [...(await import("@/core/config/modules")).MODULE_CATALOG];

  return base.map((m) => {
    const o = bySku.get(m.sku);
    return {
      ...m,
      effectiveMonthly: o?.monthlyPrice ?? m.monthlyPrice,
      effectiveYearly: o?.yearlyPrice ?? m.yearlyPrice,
      overrideEnabled: o?.enabled ?? m.enabled,
      enabled: o?.enabled ?? m.enabled,
    };
  });
}

export async function upsertModulePriceOverride(input: {
  sku: string;
  monthlyPrice?: number | null;
  yearlyPrice?: number | null;
  enabled?: boolean;
}) {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");
  if (!getModule(input.sku)) throw new Error("Unknown module SKU");

  const existing = (
    await db.select().from(modulePriceOverrides).where(eq(modulePriceOverrides.sku, input.sku)).limit(1)
  )[0];

  if (existing) {
    await db
      .update(modulePriceOverrides)
      .set({
        monthlyPrice: input.monthlyPrice ?? existing.monthlyPrice,
        yearlyPrice: input.yearlyPrice ?? existing.yearlyPrice,
        enabled: input.enabled ?? existing.enabled,
        updatedAt: new Date(),
      })
      .where(eq(modulePriceOverrides.sku, input.sku));
    return;
  }

  await db.insert(modulePriceOverrides).values({
    sku: input.sku,
    monthlyPrice: input.monthlyPrice ?? null,
    yearlyPrice: input.yearlyPrice ?? null,
    enabled: input.enabled ?? true,
  });
}

export async function getIndustrySettingsRow(group: IndustryGroup | string) {
  const db = getPlatformDb();
  if (!db) return null;
  const g = resolveIndustryGroup(group);
  return (
    await db.select().from(industrySettings).where(eq(industrySettings.industryGroup, g)).limit(1)
  )[0] ?? null;
}

export async function upsertIndustrySettings(input: {
  industryGroup: string;
  enabled?: boolean;
  creatorDiscountPctMonthly?: number | null;
  creatorDiscountPctYearly?: number | null;
  creatorLaunchCoupon?: string | null;
}) {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");
  const g = resolveIndustryGroup(input.industryGroup);
  const existing = (
    await db.select().from(industrySettings).where(eq(industrySettings.industryGroup, g)).limit(1)
  )[0];

  if (existing) {
    await db
      .update(industrySettings)
      .set({
        enabled: input.enabled ?? existing.enabled,
        creatorDiscountPctMonthly:
          input.creatorDiscountPctMonthly === undefined
            ? existing.creatorDiscountPctMonthly
            : input.creatorDiscountPctMonthly,
        creatorDiscountPctYearly:
          input.creatorDiscountPctYearly === undefined
            ? existing.creatorDiscountPctYearly
            : input.creatorDiscountPctYearly,
        creatorLaunchCoupon:
          input.creatorLaunchCoupon === undefined ? existing.creatorLaunchCoupon : input.creatorLaunchCoupon,
        updatedAt: new Date(),
      })
      .where(eq(industrySettings.industryGroup, g));
    return;
  }

  await db.insert(industrySettings).values({
    industryGroup: g,
    enabled: input.enabled ?? true,
    creatorDiscountPctMonthly: input.creatorDiscountPctMonthly ?? null,
    creatorDiscountPctYearly: input.creatorDiscountPctYearly ?? null,
    creatorLaunchCoupon: input.creatorLaunchCoupon ?? null,
  });
}

export async function listAllIndustrySettings() {
  const db = getPlatformDb();
  if (!db) return [];
  return db.select().from(industrySettings);
}
