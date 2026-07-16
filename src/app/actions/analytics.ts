"use server";

import { ANALYTICS_DASHBOARD_DAYS, ANALYTICS_LITE_SKU } from "@/core/config/analytics";
import { getSession } from "@/platform/auth/session";
import {
  businessHasAnalyticsLite,
  getAnalyticsSummary,
  type AnalyticsSummary,
} from "@/platform/analytics/service";
import { assertBusinessOwnership } from "@/platform/business/require-business";

export async function getAnalyticsDashboardAction(
  businessId: string,
): Promise<
  | { success: true; entitled: true; summary: AnalyticsSummary }
  | { success: true; entitled: false; summary: null }
  | { success: false; error: string }
> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const entitled = await businessHasAnalyticsLite(businessId);
    if (!entitled) {
      return { success: true, entitled: false, summary: null };
    }

    const summary = await getAnalyticsSummary(businessId, ANALYTICS_DASHBOARD_DAYS);
    return { success: true, entitled: true, summary };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export { ANALYTICS_LITE_SKU };
