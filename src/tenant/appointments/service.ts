import { and, asc, eq, gte, inArray, isNotNull, lte } from "drizzle-orm";
import crypto from "crypto";
import {
  buildAvailableSlots,
  isSlotAvailable,
  type OccupiedSlot,
  type WeeklyHours,
  DEFAULT_SALON_HOURS,
} from "@/core/utils/appointment-slots";
import { getPlatformDb } from "@/platform/db/client";
import {
  appointmentHolds,
  businesses,
  salonPackages,
  staffMembers,
} from "@/platform/db/schema";
import { writeToTenantStorage } from "@/tenant/storage/write-service";
import { tryPushBookingToGoogleCalendar } from "@/platform/integrations/google-calendar";

export type PackagePaymentMode = "free" | "pay_at_salon" | "pay_then_book";

/** Soft hold while client completes Razorpay (docs: 10–15 min). */
export const PAY_HOLD_MINUTES = 15;

const ACTIVE_STATUSES = ["confirmed", "pending_payment"] as const;

/**
 * Expire unpaid soft holds so slots free up. Call before slot availability checks.
 */
export async function expireStalePaymentHolds(businessId?: string): Promise<number> {
  const db = getPlatformDb();
  if (!db) return 0;

  const now = new Date();
  const conditions = [
    eq(appointmentHolds.status, "pending_payment"),
    isNotNull(appointmentHolds.holdExpiresAt),
    lte(appointmentHolds.holdExpiresAt, now),
  ];
  if (businessId) {
    conditions.push(eq(appointmentHolds.businessId, businessId));
  }

  const stale = await db
    .select({ id: appointmentHolds.id })
    .from(appointmentHolds)
    .where(and(...conditions))
    .limit(100);

  for (const row of stale) {
    await db
      .update(appointmentHolds)
      .set({ status: "cancelled", paymentStatus: "expired", updatedAt: now })
      .where(eq(appointmentHolds.id, row.id));
  }
  return stale.length;
}

export async function listActiveHoldsForDate(
  businessId: string,
  slotDate: string,
  staffId?: string | null,
): Promise<OccupiedSlot[]> {
  const db = getPlatformDb();
  if (!db) return [];

  await expireStalePaymentHolds(businessId);

  const now = new Date();
  const rows = await db
    .select()
    .from(appointmentHolds)
    .where(
      and(
        eq(appointmentHolds.businessId, businessId),
        eq(appointmentHolds.slotDate, slotDate),
        inArray(appointmentHolds.status, [...ACTIVE_STATUSES]),
      ),
    );

  return rows
    .filter((r) => {
      // Drop pending holds that are expired but not yet cleaned (race)
      if (
        r.status === "pending_payment" &&
        r.holdExpiresAt &&
        r.holdExpiresAt.getTime() <= now.getTime()
      ) {
        return false;
      }
      if (staffId && r.staffId && r.staffId !== staffId) return false;
      return true;
    })
    .map((r) => ({
      slotDate: r.slotDate,
      slotTime: r.slotTime,
      durationMinutes: r.durationMinutes,
      staffId: r.staffId,
      capacityUsed: 1,
    }));
}

export async function getPublicStaffForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db
    .select({
      id: staffMembers.id,
      name: staffMembers.name,
      role: staffMembers.role,
      slotCapacity: staffMembers.slotCapacity,
      weeklyHours: staffMembers.weeklyHours,
    })
    .from(staffMembers)
    .where(and(eq(staffMembers.businessId, businessId), eq(staffMembers.isActive, true)));
}

export async function getSlotsForBooking(input: {
  businessId: string;
  isoDate: string;
  durationMinutes: number;
  staffId?: string | null;
}): Promise<{ time: string; label: string; available: boolean }[]> {
  const staffList = await getPublicStaffForBusiness(input.businessId);
  const staff = input.staffId ? staffList.find((s) => s.id === input.staffId) : null;
  const weeklyHours = (staff?.weeklyHours as WeeklyHours | null) ?? DEFAULT_SALON_HOURS;
  const capacity = staff?.slotCapacity ?? 1;
  const occupied = await listActiveHoldsForDate(input.businessId, input.isoDate, input.staffId);

  return buildAvailableSlots({
    isoDate: input.isoDate,
    durationMinutes: input.durationMinutes,
    weeklyHours,
    occupied,
    staffId: input.staffId,
    capacity,
    stepMinutes: 30,
  });
}

export type CreateFreeBookingInput = {
  businessId: string;
  handle: string;
  packageId: string;
  slotDate: string;
  slotTime: string;
  customerName: string;
  customerPhone: string;
  staffId?: string | null;
  channel?: string;
};

/**
 * Free / pay-at-salon confirm — no Razorpay. Writes platform hold (no PII) + Sheets row (PII).
 */
export async function createFreeAppointment(
  input: CreateFreeBookingInput,
): Promise<
  | { ok: true; bookingId: string; paymentMode: PackagePaymentMode; paymentStatus: string }
  | { ok: false; error: string }
> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  const biz = (
    await db.select().from(businesses).where(eq(businesses.id, input.businessId)).limit(1)
  )[0];
  if (!biz || !biz.isPublished) return { ok: false, error: "Salon not found" };

  const pkg = (
    await db
      .select()
      .from(salonPackages)
      .where(
        and(
          eq(salonPackages.id, input.packageId),
          eq(salonPackages.businessId, input.businessId),
          eq(salonPackages.isActive, true),
        ),
      )
      .limit(1)
  )[0];
  if (!pkg) return { ok: false, error: "Package not found" };

  const paymentMode = (pkg.paymentMode as PackagePaymentMode) || "free";
  if (paymentMode === "pay_then_book") {
    return {
      ok: false,
      error: "This package requires online payment. Use pay-then-book.",
    };
  }

  let staffName: string | null = null;
  let capacity = 1;
  let weeklyHours: WeeklyHours | null = DEFAULT_SALON_HOURS;

  if (input.staffId) {
    const staff = (
      await db
        .select()
        .from(staffMembers)
        .where(
          and(
            eq(staffMembers.id, input.staffId),
            eq(staffMembers.businessId, input.businessId),
            eq(staffMembers.isActive, true),
          ),
        )
        .limit(1)
    )[0];
    if (!staff) return { ok: false, error: "Staff member not available" };
    staffName = staff.name;
    capacity = staff.slotCapacity;
    weeklyHours = (staff.weeklyHours as WeeklyHours | null) ?? DEFAULT_SALON_HOURS;
  }

  const occupied = await listActiveHoldsForDate(input.businessId, input.slotDate, input.staffId);
  if (
    !isSlotAvailable({
      isoDate: input.slotDate,
      slotTime: input.slotTime,
      durationMinutes: pkg.durationMinutes,
      weeklyHours,
      occupied,
      staffId: input.staffId,
      capacity,
    })
  ) {
    return { ok: false, error: "That slot is no longer available. Pick another time." };
  }

  const bookingId = crypto.randomUUID();
  const paymentStatus = paymentMode === "pay_at_salon" ? "pay_at_salon" : "none";
  const status = "confirmed";

  await db.insert(appointmentHolds).values({
    businessId: input.businessId,
    bookingId,
    packageId: pkg.id,
    packageName: pkg.name,
    staffId: input.staffId || null,
    staffName,
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    durationMinutes: pkg.durationMinutes,
    price: pkg.price,
    paymentMode,
    paymentStatus,
    status,
    channel: input.channel ?? "web",
  });

  // Customer PII → tenant storage only
  const sheetWrite = await writeToTenantStorage(input.businessId, "Appointments", {
    bookingId,
    packageId: pkg.id,
    packageName: pkg.name,
    price: pkg.price,
    durationMinutes: pkg.durationMinutes,
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    staffId: input.staffId ?? "",
    staffName: staffName ?? "",
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    paymentMode,
    paymentStatus,
    status,
    channel: input.channel ?? "web",
    createdAt: new Date().toISOString(),
  });

  // Best-effort Google Calendar push (FREE capability)
  const gcal = await tryPushBookingToGoogleCalendar({
    businessId: input.businessId,
    bookingId,
    packageName: pkg.name,
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    durationMinutes: pkg.durationMinutes,
    staffName,
  });
  if (gcal.eventId) {
    await db
      .update(appointmentHolds)
      .set({ googleEventId: gcal.eventId, updatedAt: new Date() })
      .where(eq(appointmentHolds.bookingId, bookingId));
  }

  if (!sheetWrite.ok) {
    // Hold is still valid; sheet write queued
    return {
      ok: true,
      bookingId,
      paymentMode,
      paymentStatus,
    };
  }

  return { ok: true, bookingId, paymentMode, paymentStatus };
}

export async function listDashboardAppointments(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];

  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const holds = await db
    .select()
    .from(appointmentHolds)
    .where(and(eq(appointmentHolds.businessId, businessId), gte(appointmentHolds.slotDate, iso)))
    .orderBy(asc(appointmentHolds.slotDate), asc(appointmentHolds.slotTime))
    .limit(200);

  // Merge customer contact from Sheets when available
  let sheetById = new Map<string, Record<string, string | number | boolean>>();
  try {
    const { readCachedSheetRows } = await import("@/tenant/storage/write-service");
    const rows = await readCachedSheetRows(businessId, "Appointments");
    for (const r of rows) {
      const id = String(r.bookingId ?? "");
      if (id) sheetById.set(id, r);
    }
  } catch {
    sheetById = new Map();
  }

  return holds.map((h) => {
    const sheet = sheetById.get(h.bookingId);
    return {
      ...h,
      customerName: sheet ? String(sheet.customerName ?? "—") : "—",
      customerPhone: sheet ? String(sheet.customerPhone ?? "") : "",
    };
  });
}

export async function updateAppointmentStatus(
  businessId: string,
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed" | "no_show",
) {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  await db
    .update(appointmentHolds)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(appointmentHolds.businessId, businessId), eq(appointmentHolds.bookingId, bookingId)));
}

/**
 * Soft-hold a slot for pay-then-book (pending_payment, expires in PAY_HOLD_MINUTES).
 * Customer PII is NOT written to Sheets until payment succeeds.
 */
export async function createPendingPaymentHold(input: {
  businessId: string;
  packageId: string;
  slotDate: string;
  slotTime: string;
  staffId?: string | null;
  checkoutSessionId?: string | null;
  bookingId?: string;
}): Promise<
  | {
      ok: true;
      bookingId: string;
      holdExpiresAt: Date;
      packageName: string;
      price: number;
      durationMinutes: number;
      staffName: string | null;
    }
  | { ok: false; error: string }
> {
  const db = getPlatformDb();
  if (!db) return { ok: false, error: "Database not connected" };

  await expireStalePaymentHolds(input.businessId);

  const biz = (
    await db.select().from(businesses).where(eq(businesses.id, input.businessId)).limit(1)
  )[0];
  if (!biz || !biz.isPublished) return { ok: false, error: "Salon not found" };

  const pkg = (
    await db
      .select()
      .from(salonPackages)
      .where(
        and(
          eq(salonPackages.id, input.packageId),
          eq(salonPackages.businessId, input.businessId),
          eq(salonPackages.isActive, true),
        ),
      )
      .limit(1)
  )[0];
  if (!pkg) return { ok: false, error: "Package not found" };
  if ((pkg.paymentMode || "free") !== "pay_then_book") {
    return { ok: false, error: "Package is not configured for pay-then-book" };
  }
  if (pkg.price < 1) {
    return { ok: false, error: "Pay-then-book packages need a price of at least ₹1" };
  }

  // Paid module gate (Select modules)
  const { hasModule } = await import("@/platform/billing/entitlements");
  if (!(await hasModule(input.businessId, "sb.pay_then_book"))) {
    return {
      ok: false,
      error: "Pay then book module is not active for this business.",
    };
  }

  let staffName: string | null = null;
  let capacity = 1;
  let weeklyHours: WeeklyHours | null = DEFAULT_SALON_HOURS;

  if (input.staffId) {
    const staff = (
      await db
        .select()
        .from(staffMembers)
        .where(
          and(
            eq(staffMembers.id, input.staffId),
            eq(staffMembers.businessId, input.businessId),
            eq(staffMembers.isActive, true),
          ),
        )
        .limit(1)
    )[0];
    if (!staff) return { ok: false, error: "Staff member not available" };
    staffName = staff.name;
    capacity = staff.slotCapacity;
    weeklyHours = (staff.weeklyHours as WeeklyHours | null) ?? DEFAULT_SALON_HOURS;
  }

  const occupied = await listActiveHoldsForDate(input.businessId, input.slotDate, input.staffId);
  if (
    !isSlotAvailable({
      isoDate: input.slotDate,
      slotTime: input.slotTime,
      durationMinutes: pkg.durationMinutes,
      weeklyHours,
      occupied,
      staffId: input.staffId,
      capacity,
    })
  ) {
    return { ok: false, error: "That slot is no longer available. Pick another time." };
  }

  const bookingId = input.bookingId ?? crypto.randomUUID();
  const holdExpiresAt = new Date(Date.now() + PAY_HOLD_MINUTES * 60 * 1000);

  await db.insert(appointmentHolds).values({
    businessId: input.businessId,
    bookingId,
    packageId: pkg.id,
    packageName: pkg.name,
    staffId: input.staffId || null,
    staffName,
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    durationMinutes: pkg.durationMinutes,
    price: pkg.price,
    paymentMode: "pay_then_book",
    paymentStatus: "pending",
    status: "pending_payment",
    channel: "web",
    holdExpiresAt,
    checkoutSessionId: input.checkoutSessionId ?? null,
  });

  return {
    ok: true,
    bookingId,
    holdExpiresAt,
    packageName: pkg.name,
    price: pkg.price,
    durationMinutes: pkg.durationMinutes,
    staffName,
  };
}

/** Cancel a soft hold (payment dismissed / failed). */
export async function releasePaymentHold(bookingId: string, businessId: string) {
  const db = getPlatformDb();
  if (!db) return;
  await db
    .update(appointmentHolds)
    .set({ status: "cancelled", paymentStatus: "released", updatedAt: new Date() })
    .where(
      and(
        eq(appointmentHolds.bookingId, bookingId),
        eq(appointmentHolds.businessId, businessId),
        eq(appointmentHolds.status, "pending_payment"),
      ),
    );
}

/** Confirm soft hold after successful tenant Razorpay payment. */
export async function confirmPaidAppointmentHold(input: {
  businessId: string;
  bookingId: string;
  packageId: string;
  packageName: string;
  price: number;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  staffId?: string | null;
  staffName?: string | null;
}) {
  const db = getPlatformDb();
  if (!db) return;

  const existing = (
    await db
      .select()
      .from(appointmentHolds)
      .where(eq(appointmentHolds.bookingId, input.bookingId))
      .limit(1)
  )[0];

  if (existing) {
    if (existing.status === "cancelled" || existing.paymentStatus === "expired") {
      // Hold expired during payment — still confirm if money taken (salon can resolve)
    }
    await db
      .update(appointmentHolds)
      .set({
        status: "confirmed",
        paymentStatus: "paid",
        paymentMode: "pay_then_book",
        holdExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(appointmentHolds.id, existing.id));
  } else {
    await db.insert(appointmentHolds).values({
      businessId: input.businessId,
      bookingId: input.bookingId,
      packageId: input.packageId,
      packageName: input.packageName,
      staffId: input.staffId ?? null,
      staffName: input.staffName ?? null,
      slotDate: input.slotDate,
      slotTime: input.slotTime,
      durationMinutes: input.durationMinutes,
      price: input.price,
      paymentMode: "pay_then_book",
      paymentStatus: "paid",
      status: "confirmed",
      channel: "web",
    });
  }

  await tryPushBookingToGoogleCalendar({
    businessId: input.businessId,
    bookingId: input.bookingId,
    packageName: input.packageName,
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    durationMinutes: input.durationMinutes,
    staffName: input.staffName ?? null,
  });
}

/** @deprecated use confirmPaidAppointmentHold */
export async function recordPaidAppointmentHold(
  input: Parameters<typeof confirmPaidAppointmentHold>[0],
) {
  return confirmPaidAppointmentHold(input);
}

