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
    orderStatus: "placed",
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
    durationMinutes?: number;
    staffId?: string | null;
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
    paymentMode: "pay_then_book",
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  // Confirm soft hold + Google Calendar push (platform index, no PII)
  try {
    const { confirmPaidAppointmentHold } = await import("@/tenant/appointments/service");
    await confirmPaidAppointmentHold({
      businessId: input.pendingBooking.businessId,
      bookingId: input.pendingBooking.bookingId,
      packageId: input.pendingBooking.packageId,
      packageName: input.pendingBooking.packageName,
      price: input.pendingBooking.price,
      slotDate: input.pendingBooking.slotDate,
      slotTime: input.pendingBooking.slotTime,
      durationMinutes:
        "durationMinutes" in input.pendingBooking && typeof input.pendingBooking.durationMinutes === "number"
          ? input.pendingBooking.durationMinutes
          : 60,
      staffId:
        "staffId" in input.pendingBooking
          ? (input.pendingBooking.staffId as string | null | undefined) ?? null
          : null,
    });
  } catch {
    // Non-fatal: sheet row already written
  }

  return { ok: true, bookingId: input.pendingBooking.bookingId };
}