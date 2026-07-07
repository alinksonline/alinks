"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";
import type { CartItem } from "@/core/types/commerce";
import type { SubscriptionTier } from "@/core/config/tiers";
import { canUseProCheckout } from "@/core/utils/tier-gates";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, checkoutSessions, tenants } from "@/platform/db/schema";
import { recordLegalAcceptance } from "@/platform/legal/acceptances";
import { completeStorePayment } from "@/platform/payments/complete-payment";
import { createDevOrderId, createRazorpayOrder, isRazorpayConfigured } from "@/platform/payments/razorpay";
import { writeToTenantStorage } from "@/tenant/storage/write-service";
import crypto from "crypto";

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function requestMeta() {
  const h = headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: h.get("user-agent") ?? undefined,
  };
}

export async function enableProCheckoutAction(businessId: string, acceptPaymentAddendum: boolean) {
  try {
    const session = await requireSession();
    const business = await assertBusinessOwnership(businessId, session.userId);
    if (!acceptPaymentAddendum) {
      return { success: false as const, error: "Payment addendum acceptance required" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
    if (!tenant || !canUseProCheckout(tenant.tier as SubscriptionTier, "pro")) {
      return { success: false as const, error: "Pro plan required for on-site checkout" };
    }

    const meta = await requestMeta();
    await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.PAYMENT_ADDENDUM, ...meta });

    await db
      .update(businesses)
      .set({ checkoutMode: "pro", updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    revalidatePath("/editor/commerce");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Enable failed" };
  }
}

export async function updateCodSettingAction(businessId: string, codEnabled: boolean) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.update(businesses).set({ codEnabled, updatedAt: new Date() }).where(eq(businesses.id, businessId));
    revalidatePath("/editor/commerce");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function createCheckoutSessionAction(input: {
  handle: string;
  items: CartItem[];
  paymentMethod: "upi" | "card" | "cod";
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  acceptCheckoutTerms: boolean;
}) {
  try {
    if (!input.acceptCheckoutTerms) {
      return { success: false as const, error: "Please accept checkout terms" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const rows = await db
      .select({ business: businesses, tier: tenants.tier })
      .from(businesses)
      .innerJoin(tenants, eq(businesses.tenantId, tenants.id))
      .where(eq(businesses.handle, input.handle))
      .limit(1);

    const row = rows[0];
    if (!row || !row.business.isPublished) return { success: false as const, error: "Store not found" };
    if (!canUseProCheckout(row.tier as SubscriptionTier, row.business.checkoutMode)) {
      return { success: false as const, error: "Pro checkout not enabled" };
    }
    if (input.paymentMethod === "cod" && !row.business.codEnabled) {
      return { success: false as const, error: "COD is disabled for this store" };
    }

    const total = input.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    if (total <= 0) return { success: false as const, error: "Cart is empty" };

    const orderId = crypto.randomUUID();
    const amountPaise = total * 100;

    if (input.paymentMethod === "cod") {
      await writeToTenantStorage(row.business.id, "Orders", {
        orderId,
        total,
        paymentMethod: "cod",
        paymentStatus: "cod_pending",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress ?? "",
        items: JSON.stringify(input.items),
        createdAt: new Date().toISOString(),
      });

      return { success: true as const, orderId, paymentMethod: "cod" as const, devMode: !isRazorpayConfigured() };
    }

    const [session] = await db
      .insert(checkoutSessions)
      .values({
        businessId: row.business.id,
        amountPaise,
        paymentMethod: input.paymentMethod,
        status: "created",
      })
      .returning();

    const razorpayOrder = await createRazorpayOrder(amountPaise, session.id);
    const razorpayConfigured = isRazorpayConfigured();
    const razorpayOrderId = razorpayOrder.ok ? razorpayOrder.orderId : createDevOrderId();

    if (razorpayConfigured && !razorpayOrder.ok) {
      return { success: false as const, error: razorpayOrder.error };
    }

    await db
      .update(checkoutSessions)
      .set({ razorpayOrderId })
      .where(eq(checkoutSessions.id, session.id));

    return {
      success: true as const,
      sessionId: session.id,
      orderId,
      razorpayOrderId,
      amountPaise,
      paymentMethod: input.paymentMethod,
      devMode: !razorpayConfigured,
      businessName: row.business.name,
      pendingOrder: {
        businessId: row.business.id,
        orderId,
        items: input.items,
        total,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress ?? "",
      },
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Checkout failed" };
  }
}

export async function completeDevPaymentAction(input: {
  sessionId: string;
  pendingOrder: {
    businessId: string;
    orderId: string;
    items: CartItem[];
    total: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  };
  paymentMethod: "upi" | "card";
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const session = (
      await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, input.sessionId)).limit(1)
    )[0];
    if (!session || session.status === "paid") {
      return { success: false as const, error: "Invalid session" };
    }

    const completed = await completeStorePayment({
      sessionId: input.sessionId,
      pendingOrder: input.pendingOrder,
      paymentMethod: input.paymentMethod,
    });
    if (!completed.ok) return { success: false as const, error: completed.error };

    return { success: true as const, orderId: completed.orderId };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Payment failed" };
  }
}