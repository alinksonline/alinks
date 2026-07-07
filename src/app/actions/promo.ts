"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import { redeemPromoCode } from "@/platform/billing/promo";

export async function applyPromoCodeAction(code: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const result = await redeemPromoCode(session.userId, code);
  if (!result.ok) return { success: false as const, error: result.error };

  revalidatePath("/billing");
  return { success: true as const, months: result.months, trialEndsAt: result.trialEndsAt.toISOString() };
}