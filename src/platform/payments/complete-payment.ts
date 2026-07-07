import { eq } from "drizzle-orm";
import type { CartItem } from "@/core/types/commerce";
import { getPlatformDb } from "@/platform/db/client";
import { checkoutSessions } from "@/platform/db/schema";
import { writeToTenantStorage } from "@/tenant/storage/write-service";

export async function completeStorePayment(input: {
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
}): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  const session = (
    await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, input.sessionId)).limit(1)
  )[0];
  if (!session || session.status === "paid") {
    return { ok: false, error: "Invalid or already completed session" };
  }

  await db
    .update(checkoutSessions)
    .set({ status: "paid", completedAt: new Date() })
    .where(eq(checkoutSessions.id, input.sessionId));

  await writeToTenantStorage(input.pendingOrder.businessId, "Orders", {
    orderId: input.pendingOrder.orderId,
    total: input.pendingOrder.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "paid",
    customerName: input.pendingOrder.customerName,
    customerPhone: input.pendingOrder.customerPhone,
    customerAddress: input.pendingOrder.customerAddress,
    items: JSON.stringify(input.pendingOrder.items),
    razorpaySessionId: input.sessionId,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, orderId: input.pendingOrder.orderId };
}

export async function completeBookingPayment(input: {
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
}): Promise<{ ok: true; bookingId: string } | { ok: false; error: string }> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  const session = (
    await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, input.sessionId)).limit(1)
  )[0];
  if (!session || session.status === "paid") {
    return { ok: false, error: "Invalid or already completed session" };
  }

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

  return { ok: true, bookingId: input.pendingBooking.bookingId };
}