"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { getPlatformDb } from "@/platform/db/client";
import { businesses, checkoutSessions, salonPackages, tenants } from "@/platform/db/schema";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { SALON_PACKAGE_TEMPLATES } from "@/tenant/salon/package-templates";
import { createDevOrderId, createRazorpayOrder, isRazorpayConfigured } from "@/platform/payments/razorpay";
import { writeToTenantStorage } from "@/tenant/storage/write-service";

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
      }))
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

export async function createBookingAction(input: {
  handle: string;
  packageId: string;
  slotDate: string;
  slotTime: string;
  customerName: string;
  customerPhone: string;
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

    const pkg = (
      await db
        .select()
        .from(salonPackages)
        .where(and(eq(salonPackages.id, input.packageId), eq(salonPackages.businessId, row.business.id)))
        .limit(1)
    )[0];
    if (!pkg) return { success: false as const, error: "Package not found" };

    const bookingId = crypto.randomUUID();

    if (!input.payNow) {
      await writeToTenantStorage(row.business.id, "Appointments", {
        bookingId,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        slotDate: input.slotDate,
        slotTime: input.slotTime,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
      });
      return { success: true as const, bookingId, paymentStatus: "pending" as const };
    }

    const amountPaise = pkg.price * 100;
    const [session] = await db
      .insert(checkoutSessions)
      .values({
        businessId: row.business.id,
        amountPaise,
        paymentMethod: "upi",
        status: "created",
      })
      .returning();

    const razorpayOrder = await createRazorpayOrder(amountPaise, session.id);
    const razorpayOrderId = razorpayOrder?.id ?? createDevOrderId();
    await db.update(checkoutSessions).set({ razorpayOrderId }).where(eq(checkoutSessions.id, session.id));

    return {
      success: true as const,
      bookingId,
      sessionId: session.id,
      razorpayOrderId,
      amountPaise,
      devMode: !isRazorpayConfigured(),
      pendingBooking: {
        businessId: row.business.id,
        bookingId,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        slotDate: input.slotDate,
        slotTime: input.slotTime,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
      },
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Booking failed" };
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
  };
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(checkoutSessions)
      .set({ status: "paid", completedAt: new Date() })
      .where(eq(checkoutSessions.id, input.sessionId));

    await writeToTenantStorage(input.pendingBooking.businessId, "Appointments", {
      bookingId: input.pendingBooking.bookingId,
      packageId: input.pendingBooking.packageId,
      packageName: input.pendingBooking.packageName,
      price: input.pendingBooking.price,
      slotDate: input.pendingBooking.slotDate,
      slotTime: input.pendingBooking.slotTime,
      customerName: input.pendingBooking.customerName,
      customerPhone: input.pendingBooking.customerPhone,
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
    });

    return { success: true as const, bookingId: input.pendingBooking.bookingId };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Payment failed" };
  }
}