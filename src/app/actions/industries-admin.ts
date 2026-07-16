"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import {
  getEffectiveModuleCatalog,
  listAllIndustrySettings,
  upsertIndustrySettings,
  upsertModulePriceOverride,
} from "@/platform/billing/entitlements";
import { INDUSTRY_REGISTRY, INDUSTRY_GROUPS } from "@/core/config/industries";

async function requireSuperadmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getIndustriesAdminDataAction() {
  try {
    await requireSuperadmin();
    const [catalog, settings] = await Promise.all([
      getEffectiveModuleCatalog(),
      listAllIndustrySettings(),
    ]);
    const settingsByGroup = Object.fromEntries(settings.map((s) => [s.industryGroup, s]));
    const industries = INDUSTRY_GROUPS.map((g) => {
      const def = INDUSTRY_REGISTRY[g];
      const row = settingsByGroup[g];
      return {
        group: g,
        label: def.label,
        selectable: def.flags.selectable,
        salesEnabled: def.flags.salesEnabled,
        commerceModulesAllowed: def.flags.commerceModulesAllowed,
        bookingModulesAllowed: def.flags.bookingModulesAllowed,
        licenseGate: def.flags.licenseGate,
        enabled: row?.enabled ?? def.flags.selectable,
        creatorDiscountPctMonthly: row?.creatorDiscountPctMonthly ?? null,
        creatorDiscountPctYearly: row?.creatorDiscountPctYearly ?? null,
        creatorLaunchCoupon: row?.creatorLaunchCoupon ?? null,
      };
    });
    return { success: true as const, industries, catalog };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Failed",
      industries: [],
      catalog: [],
    };
  }
}

export async function saveIndustrySettingsAction(input: {
  industryGroup: string;
  enabled: boolean;
  creatorDiscountPctMonthly?: number | null;
  creatorDiscountPctYearly?: number | null;
  creatorLaunchCoupon?: string | null;
}) {
  try {
    await requireSuperadmin();
    await upsertIndustrySettings({
      industryGroup: input.industryGroup,
      enabled: input.enabled,
      creatorDiscountPctMonthly: input.creatorDiscountPctMonthly,
      creatorDiscountPctYearly: input.creatorDiscountPctYearly,
      creatorLaunchCoupon: input.creatorLaunchCoupon?.trim() || null,
    });
    revalidatePath("/superadmin/industries");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function saveModulePriceAction(input: {
  sku: string;
  monthlyPrice?: number | null;
  yearlyPrice?: number | null;
  enabled: boolean;
}) {
  try {
    await requireSuperadmin();
    await upsertModulePriceOverride(input);
    revalidatePath("/superadmin/industries");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
