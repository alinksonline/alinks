"use server";

import { revalidatePath } from "next/cache";
import { canEnableFoodModule, resolveFoodType } from "@/core/config/food-compat";
import {
  getIndustryDef,
  resolveIndustryGroup,
  type IndustryGroup,
} from "@/core/config/industries";
import {
  getModule,
  selectableModulesForIndustry,
  type ModuleDef,
} from "@/core/config/modules";
import type { BillingCycle, SubscriptionTier } from "@/core/config/tiers";
import { getSession } from "@/platform/auth/session";
import {
  getEffectiveModuleCatalog,
  getIndustrySettingsRow,
  listEntitledSkus,
  setModuleEntitlement,
} from "@/platform/billing/entitlements";
import {
  buildSelectModulesQuote,
  toModulePriceLine,
  type ModulePriceLine,
  type SelectModulesQuote,
} from "@/core/config/select-modules-quote";
import { requireBusiness } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, tenants } from "@/platform/db/schema";
import { eq } from "drizzle-orm";

export type BillingModulesPayload = {
  businessId: string;
  businessName: string;
  industryGroup: IndustryGroup;
  industryType: string;
  tier: SubscriptionTier;
  /** Modules tenant may select (paid / optional for this industry). */
  selectable: ModulePriceLine[];
  /** Included with website (read-only list for transparency). */
  included: ModulePriceLine[];
  entitledSkus: string[];
  creator: {
    partnerTier: string | null;
    discountPctMonthly: number | null;
    discountPctYearly: number | null;
    industryPctMonthly: number | null;
    industryPctYearly: number | null;
  };
  /** Sample quote with currently entitled paid SKUs. */
  quote: SelectModulesQuote;
};

function isModuleAllowedForBusiness(
  mod: ModuleDef,
  industryGroup: string,
  industryType: string,
  vertical: string,
): boolean {
  if (!mod.enabled) return false;
  if (mod.status === "later") return false;

  if (industryGroup === "food" || vertical === "restaurant" || vertical === "food") {
    const foodType = resolveFoodType(industryType, vertical);
    if (!canEnableFoodModule(foodType, mod.sku)) return false;
  }

  return true;
}

export async function getBillingModulesDataAction(
  cycle: BillingCycle = "annual",
): Promise<{ success: true; data: BillingModulesPayload } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const business = await requireBusiness(session);
  const db = getPlatformDb();
  if (!db) return { success: false, error: "Database not connected" };

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
  const tier = (tenant?.tier ?? "basic") as SubscriptionTier;
  const group = resolveIndustryGroup(business.industryGroup || business.vertical);
  const industrySettings = await getIndustrySettingsRow(group);

  const catalog = await getEffectiveModuleCatalog(group);
  const entitledSkus = await listEntitledSkus(business.id);

  const selectableDefs = selectableModulesForIndustry(group).filter((m) =>
    isModuleAllowedForBusiness(m, group, business.industryType, business.vertical),
  );

  // Merge effective prices from catalog overrides.
  const priceBySku = new Map(catalog.map((m) => [m.sku, m]));
  const selectable: ModulePriceLine[] = selectableDefs.map((m) => {
    const eff = priceBySku.get(m.sku);
    return toModulePriceLine(
      {
        ...m,
        effectiveMonthly: eff?.effectiveMonthly,
        effectiveYearly: eff?.effectiveYearly,
        enabled: eff?.enabled ?? m.enabled,
      },
      entitledSkus,
    );
  });

  const includedDefs = catalog.filter(
    (m) =>
      m.includedInWebsite &&
      m.enabled &&
      isModuleAllowedForBusiness(m, group, business.industryType, business.vertical),
  );
  const included: ModulePriceLine[] = includedDefs.map((m) => toModulePriceLine(m, entitledSkus));

  const paidSelected = entitledSkus.filter((sku) => {
    const mod = getModule(sku);
    return mod && !mod.includedInWebsite;
  });

  const creator = {
    partnerTier: business.creatorPartnerTier,
    discountPctMonthly: business.creatorDiscountPctMonthly,
    discountPctYearly: business.creatorDiscountPctYearly,
    industryPctMonthly: industrySettings?.creatorDiscountPctMonthly ?? null,
    industryPctYearly: industrySettings?.creatorDiscountPctYearly ?? null,
  };

  const quote = buildSelectModulesQuote({
    tier,
    cycle,
    selectedSkus: paidSelected,
    catalog,
    creator: {
      ...creator,
      industryGroup: group,
    },
  });

  return {
    success: true,
    data: {
      businessId: business.id,
      businessName: business.name,
      industryGroup: group,
      industryType: business.industryType,
      tier,
      selectable,
      included,
      entitledSkus,
      creator,
      quote,
    },
  };
}

/**
 * Enable or disable paid module SKUs for the active business.
 * Industry allowlist + food type gates enforced. Payment collection is Phase 1
 * (Razorpay subscription not live) — selection unlocks modules on this business.
 */
export async function updateModuleSelectionsAction(input: {
  enableSkus: string[];
  disableSkus?: string[];
}): Promise<{ success: true; entitledSkus: string[] } | { success: false; error: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const business = await requireBusiness(session);
    const group = resolveIndustryGroup(business.industryGroup || business.vertical);
    const def = getIndustryDef(group);

    const allowlist = new Set(
      selectableModulesForIndustry(group)
        .filter((m) =>
          isModuleAllowedForBusiness(m, group, business.industryType, business.vertical),
        )
        .map((m) => m.sku),
    );

    // Presence never sells commerce modules.
    if (!def.flags.commerceModulesAllowed) {
      for (const sku of input.enableSkus) {
        const mod = getModule(sku);
        if (mod?.category === "commerce") {
          return {
            success: false,
            error: "Commerce modules are not available on Presence. Switch industry to sell.",
          };
        }
      }
    }

    for (const sku of input.enableSkus) {
      if (!allowlist.has(sku)) {
        return { success: false, error: `Module not available for your industry: ${sku}` };
      }
      await setModuleEntitlement(business.id, sku, true, "billing");
    }

    for (const sku of input.disableSkus ?? []) {
      // Only disable optional paid modules — never strip included core via this UI.
      const mod = getModule(sku);
      if (!mod || mod.includedInWebsite) continue;
      await setModuleEntitlement(business.id, sku, false, "billing");
    }

    // Sync food channel flags when paid ops modules are removed
    const disabled = new Set(input.disableSkus ?? []);
    if (disabled.has("food.pickup") || disabled.has("food.delivery") || disabled.has("food.dine_in")) {
      const db = getPlatformDb();
      if (db) {
        await db
          .update(businesses)
          .set({
            ...(disabled.has("food.pickup") ? { foodPickupEnabled: false } : {}),
            ...(disabled.has("food.delivery") ? { foodDeliveryEnabled: false } : {}),
            ...(disabled.has("food.dine_in") ? { foodDineInEnabled: false } : {}),
            updatedAt: new Date(),
          })
          .where(eq(businesses.id, business.id));
      }
    }

    // Drop pay_then_book mode on packages if module removed
    if (disabled.has("sb.pay_then_book")) {
      try {
        const { and } = await import("drizzle-orm");
        const { salonPackages } = await import("@/platform/db/schema");
        const db = getPlatformDb();
        if (db) {
          await db
            .update(salonPackages)
            .set({ paymentMode: "pay_at_salon" })
            .where(
              and(
                eq(salonPackages.businessId, business.id),
                eq(salonPackages.paymentMode, "pay_then_book"),
              ),
            );
        }
      } catch {
        /* non-fatal */
      }
    }

    const entitledSkus = await listEntitledSkus(business.id);
    revalidatePath("/billing");
    revalidatePath("/editor");
    revalidatePath("/editor/menu");
    revalidatePath("/editor/packages");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    return { success: true, entitledSkus };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update modules" };
  }
}

export async function previewSelectModulesQuoteAction(input: {
  cycle: BillingCycle;
  selectedSkus: string[];
  tier?: SubscriptionTier;
}): Promise<{ success: true; quote: SelectModulesQuote } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const business = await requireBusiness(session);
  const db = getPlatformDb();
  if (!db) return { success: false, error: "Database not connected" };

  const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
  const tier = (input.tier ?? tenant?.tier ?? "basic") as SubscriptionTier;
  const group = resolveIndustryGroup(business.industryGroup || business.vertical);
  const industrySettings = await getIndustrySettingsRow(group);
  const catalog = await getEffectiveModuleCatalog(group);

  const allowed = new Set(
    selectableModulesForIndustry(group)
      .filter((m) =>
        isModuleAllowedForBusiness(m, group, business.industryType, business.vertical),
      )
      .map((m) => m.sku),
  );

  const selectedSkus = input.selectedSkus.filter((s) => allowed.has(s));

  const quote = buildSelectModulesQuote({
    tier,
    cycle: input.cycle,
    selectedSkus,
    catalog,
    creator: {
      partnerTier: business.creatorPartnerTier,
      discountPctMonthly: business.creatorDiscountPctMonthly,
      discountPctYearly: business.creatorDiscountPctYearly,
      industryPctMonthly: industrySettings?.creatorDiscountPctMonthly ?? null,
      industryPctYearly: industrySettings?.creatorDiscountPctYearly ?? null,
      industryGroup: group,
    },
  });

  return { success: true, quote };
}

const TEMPLATE_BY_GROUP: Record<string, string> = {
  presence: "presence",
  salon_beauty: "salon",
  retail: "ecommerce",
  food: "food",
  bookings: "bookings",
  real_estate: "real_estate",
  education: "education",
  fitness: "fitness",
  automotive: "automotive",
  general: "general",
  pharmacy: "general",
};

/**
 * W3.C — Industry switch / upgrade (e.g. Presence → salon or retail).
 * Grants default modules for the new industry. Does not wipe content.
 */
export async function switchIndustryAction(input: {
  industryGroup: string;
  industryType: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const business = await requireBusiness(session);
    const db = getPlatformDb();
    if (!db) return { success: false, error: "Database not connected" };

    const {
      getIndustryDef,
      industryToLegacyVertical,
      resolveIndustryGroup,
      selectableIndustries,
    } = await import("@/core/config/industries");
    const { grantDefaultModules } = await import("@/platform/billing/entitlements");

    const group = resolveIndustryGroup(input.industryGroup);
    const allowed = selectableIndustries().some((i) => i.group === group);
    if (!allowed) return { success: false, error: "Industry not available" };

    const def = getIndustryDef(group);
    const typeOk = def.types.some((t) => t.slug === input.industryType);
    if (!typeOk) return { success: false, error: "Invalid industry type" };

    if (group === "pharmacy") {
      return {
        success: false,
        error: "Pharmacy OTC is gated — contact ALINKS support to enable.",
      };
    }

    const vertical = industryToLegacyVertical(group, input.industryType);
    const templateId = TEMPLATE_BY_GROUP[group] ?? "general";

    await db
      .update(businesses)
      .set({
        industryGroup: group,
        industryType: input.industryType,
        vertical,
        templateId,
        // Presence → selling: clear food ops until modules + channels re-enabled
        ...(group !== "food"
          ? {
              foodPickupEnabled: false,
              foodDeliveryEnabled: false,
              foodDineInEnabled: false,
            }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, business.id));

    await grantDefaultModules(business.id, group, "industry_switch");

    revalidatePath("/billing");
    revalidatePath("/editor");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Switch failed" };
  }
}
