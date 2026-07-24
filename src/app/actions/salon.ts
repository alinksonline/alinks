"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { getPlatformDb } from "@/platform/db/client";
import { businesses, checkoutSessions, salonPackages, tenants } from "@/platform/db/schema";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { SALON_PACKAGE_TEMPLATES } from "@/tenant/salon/package-templates";
import { completeBookingPayment } from "@/platform/payments/complete-payment";
import { createRazorpayOrder } from "@/platform/payments/razorpay";
import {
  businessHasOnlinePay,
  getTenantRazorpayCredentials,
} from "@/platform/payments/tenant-gateway";
import {
  createFreeAppointment,
  createPendingPaymentHold,
  getPublicStaffForBusiness,
  getSlotsForBooking,
  PAY_HOLD_MINUTES,
  releasePaymentHold,
} from "@/tenant/appointments/service";
import { PAY_THEN_BOOK_SKU, missingModuleMessage } from "@/core/config/module-gates";
import { canExposeBooking, canUsePayThenBook } from "@/core/utils/industry-gates";
import { hasModule, listEntitledSkus } from "@/platform/billing/entitlements";
import type { PackagePaymentMode } from "@/tenant/appointments/service";

export async function seedSalonPackagesAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const existing = await db.select().from(salonPackages).where(eq(salonPackages.businessId, businessId)).limit(1);
    if (existing.length > 0) return { success: true as const, seeded: false };

    await db.insert(salonPackages).values(
      SALON_PACKAGE_TEMPLATES.map((t) => ({
        businessId,
        name: t.name,
        description: t.description,
        price: t.price,
        durationMinutes: t.durationMinutes,
        category: t.category,
        isActive: t.isActive,
        // Free by default — Razorpay not required to go live
        paymentMode: t.price === 0 ? "free" : "pay_at_salon",
      })),
    );

    revalidatePath("/editor/packages");
    return { success: true as const, seeded: true };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Seed failed" };
  }
}

export async function getSalonPackagesForHandle(handle: string) {
  const db = getPlatformDb();
  if (!db) return [];

  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz) return [];

  return db
    .select()
    .from(salonPackages)
    .where(and(eq(salonPackages.businessId, biz.id), eq(salonPackages.isActive, true)));
}

export async function getBookPageDataAction(handle: string) {
  const db = getPlatformDb();
  if (!db) return null;

  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz || !biz.isPublished) return null;

  if (
    !canExposeBooking({
      vertical: biz.vertical,
      industryGroup: biz.industryGroup,
      industryType: biz.industryType,
      verticalGateStatus: biz.verticalGateStatus,
    })
  ) {
    return null;
  }

  const packages = await db
    .select()
    .from(salonPackages)
    .where(and(eq(salonPackages.businessId, biz.id), eq(salonPackages.isActive, true)));

  const staff = await getPublicStaffForBusiness(biz.id);

  return {
    businessId: biz.id,
    packages,
    staff: staff.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      slotCapacity: s.slotCapacity,
    })),
  };
}

export async function getAvailableSlotsAction(input: {
  handle: string;
  packageId: string;
  slotDate: string;
  staffId?: string | null;
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected", slots: [] };

    const biz = (await db.select().from(businesses).where(eq(businesses.handle, input.handle)).limit(1))[0];
    if (!biz) return { success: false as const, error: "Not found", slots: [] };

    const pkg = (
      await db
        .select()
        .from(salonPackages)
        .where(and(eq(salonPackages.id, input.packageId), eq(salonPackages.businessId, biz.id)))
        .limit(1)
    )[0];
    if (!pkg) return { success: false as const, error: "Package not found", slots: [] };

    const slots = await getSlotsForBooking({
      businessId: biz.id,
      isoDate: input.slotDate,
      durationMinutes: pkg.durationMinutes,
      staffId: input.staffId,
    });

    return { success: true as const, slots };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Failed",
      slots: [],
    };
  }
}

export async function createBookingAction(input: {
  handle: string;
  packageId: string;
  slotDate: string;
  slotTime: string;
  customerName: string;
  customerPhone: string;
  staffId?: string | null;
  /** true = pay-then-book via tenant Razorpay */
  payNow: boolean;
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const rows = await db
      .select({ business: businesses, tier: tenants.tier })
      .from(businesses)
      .innerJoin(tenants, eq(businesses.tenantId, tenants.id))
      .where(eq(businesses.handle, input.handle))
      .limit(1);

    const row = rows[0];
    if (!row || !row.business.isPublished) return { success: false as const, error: "Salon not found" };

    if (
      !canExposeBooking({
        vertical: row.business.vertical,
        industryGroup: row.business.industryGroup,
      })
    ) {
      return { success: false as const, error: "Booking is not available for this business" };
    }

    const pkg = (
      await db
        .select()
        .from(salonPackages)
        .where(and(eq(salonPackages.id, input.packageId), eq(salonPackages.businessId, row.business.id)))
        .limit(1)
    )[0];
    if (!pkg) return { success: false as const, error: "Package not found" };

    const paymentMode = pkg.paymentMode || "free";

    // Free / pay-at-salon path (default MVP)
    if (!input.payNow || paymentMode === "free" || paymentMode === "pay_at_salon") {
      if (paymentMode === "pay_then_book" && input.payNow) {
        // fall through to paid path below
      } else {
        const free = await createFreeAppointment({
          businessId: row.business.id,
          handle: input.handle,
          packageId: input.packageId,
          slotDate: input.slotDate,
          slotTime: input.slotTime,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          staffId: input.staffId,
        });
        if (!free.ok) return { success: false as const, error: free.error };
        return {
          success: true as const,
          bookingId: free.bookingId,
          paymentStatus: free.paymentStatus as "none" | "pay_at_salon" | "pending" | "paid",
          paymentMode: free.paymentMode,
        };
      }
    }

    // Pay-then-book (tenant Razorpay) — soft-hold slot, then open checkout
    if (paymentMode !== "pay_then_book") {
      return { success: false as const, error: "Invalid payment path for this package" };
    }

    if (!(await hasModule(row.business.id, PAY_THEN_BOOK_SKU))) {
      return {
        success: false as const,
        error: "Pay then book is not enabled for this business. Ask them to add the module under Billing.",
      };
    }

    const amountPaise = Math.round(pkg.price * 100);
    if (amountPaise < 100) {
      return { success: false as const, error: "This package has no online charge — use free booking." };
    }

    const tenantCreds = await getTenantRazorpayCredentials(row.business.id);
    if (!businessHasOnlinePay(row.business) || !tenantCreds) {
      return {
        success: false as const,
        error:
          "This salon has not connected Razorpay yet. Ask them to connect Checkout, or pick a free / pay-at-salon package.",
      };
    }

    const hold = await createPendingPaymentHold({
      businessId: row.business.id,
      packageId: pkg.id,
      slotDate: input.slotDate,
      slotTime: input.slotTime,
      staffId: input.staffId,
    });
    if (!hold.ok) return { success: false as const, error: hold.error };

    const [session] = await db
      .insert(checkoutSessions)
      .values({
        businessId: row.business.id,
        amountPaise,
        paymentMethod: "upi",
        status: "created",
      })
      .returning();

    const razorpayOrder = await createRazorpayOrder(amountPaise, session.id, "INR", tenantCreds);
    if (!razorpayOrder.ok) {
      await releasePaymentHold(hold.bookingId, row.business.id);
      return { success: false as const, error: razorpayOrder.error };
    }

    await db
      .update(checkoutSessions)
      .set({ razorpayOrderId: razorpayOrder.orderId })
      .where(eq(checkoutSessions.id, session.id));

    // Link session to hold
    const { appointmentHolds } = await import("@/platform/db/schema");
    await db
      .update(appointmentHolds)
      .set({ checkoutSessionId: session.id, updatedAt: new Date() })
      .where(eq(appointmentHolds.bookingId, hold.bookingId));

    return {
      success: true as const,
      bookingId: hold.bookingId,
      sessionId: session.id,
      razorpayOrderId: razorpayOrder.orderId,
      razorpayKeyId: tenantCreds.keyId,
      amountPaise,
      devMode: false,
      businessName: row.business.name,
      paymentStatus: "pending" as const,
      paymentMode: "pay_then_book" as const,
      holdMinutes: PAY_HOLD_MINUTES,
      holdExpiresAt: hold.holdExpiresAt.toISOString(),
      pendingBooking: {
        businessId: row.business.id,
        bookingId: hold.bookingId,
        packageId: pkg.id,
        packageName: hold.packageName,
        price: hold.price,
        slotDate: input.slotDate,
        slotTime: input.slotTime,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        durationMinutes: hold.durationMinutes,
        staffId: input.staffId ?? null,
      },
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Booking failed" };
  }
}

export async function releaseBookingHoldAction(input: {
  handle: string;
  bookingId: string;
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };
    const biz = (await db.select().from(businesses).where(eq(businesses.handle, input.handle)).limit(1))[0];
    if (!biz) return { success: false as const, error: "Not found" };
    await releasePaymentHold(input.bookingId, biz.id);
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

const PAYMENT_MODES = ["free", "pay_at_salon", "pay_then_book"] as const;

export async function updateSalonPackageAction(input: {
  businessId: string;
  packageId: string;
  paymentMode?: PackagePaymentMode;
  isActive?: boolean;
  price?: number;
  name?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const pkg = (
      await db
        .select()
        .from(salonPackages)
        .where(and(eq(salonPackages.id, input.packageId), eq(salonPackages.businessId, input.businessId)))
        .limit(1)
    )[0];
    if (!pkg) return { success: false as const, error: "Package not found" };

    if (input.paymentMode && !PAYMENT_MODES.includes(input.paymentMode)) {
      return { success: false as const, error: "Invalid payment mode" };
    }

    if (input.paymentMode === "pay_then_book") {
      const biz = (
        await db.select().from(businesses).where(eq(businesses.id, input.businessId)).limit(1)
      )[0];
      if (!biz) return { success: false as const, error: "Business not found" };

      const entitled = await listEntitledSkus(input.businessId);
      if (
        !canUsePayThenBook({
          vertical: biz.vertical,
          industryGroup: biz.industryGroup,
          entitledSkus: entitled,
        })
      ) {
        return {
          success: false as const,
          error: missingModuleMessage(PAY_THEN_BOOK_SKU),
        };
      }

      const gatewayOk = await businessHasOnlinePay(biz);
      if (!gatewayOk) {
        return {
          success: false as const,
          error: "Connect Razorpay under Checkout before enabling pay-then-book on a package.",
        };
      }
      if ((input.price ?? pkg.price) < 1) {
        return { success: false as const, error: "Pay-then-book needs a price of at least ₹1" };
      }
    }

    await db
      .update(salonPackages)
      .set({
        paymentMode: input.paymentMode ?? pkg.paymentMode,
        isActive: input.isActive ?? pkg.isActive,
        price: input.price ?? pkg.price,
        name: input.name?.trim() || pkg.name,
      })
      .where(eq(salonPackages.id, input.packageId));

    // Entitlement note: pay-then-book is package-level; grant module when first enabled
    if (input.paymentMode === "pay_then_book") {
      try {
        const { setModuleEntitlement } = await import("@/platform/billing/entitlements");
        await setModuleEntitlement(input.businessId, "sb.pay_then_book", true, "package_enable");
      } catch {
        /* non-fatal */
      }
    }

    revalidatePath("/editor/packages");
    revalidatePath("/editor/commerce");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function completeDevBookingPaymentAction(input: {
  sessionId: string;
  pendingBooking: {
    businessId: string;
    bookingId: string;
    packageId: string;
    packageName: string;
    price: number;
    slotDate: string;
    slotTime: string;
    customerName: string;
    customerPhone: string;
    durationMinutes?: number;
    staffId?: string | null;
  };
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const completed = await completeBookingPayment({
      sessionId: input.sessionId,
      pendingBooking: input.pendingBooking,
    });
    if (!completed.ok) return { success: false as const, error: completed.error };

    return { success: true as const, bookingId: completed.bookingId };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Payment failed" };
  }
}
