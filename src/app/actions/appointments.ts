"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import {
  connectGoogleCalendarStub,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
} from "@/platform/integrations/google-calendar";
import {
  listDashboardAppointments,
  updateAppointmentStatus,
} from "@/tenant/appointments/service";

export async function getAppointmentsForBusinessAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized", appointments: [] };
    await assertBusinessOwnership(businessId, session.userId);
    const appointments = await listDashboardAppointments(businessId);
    return { success: true as const, appointments };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Failed",
      appointments: [],
    };
  }
}

export async function updateAppointmentStatusAction(
  businessId: string,
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed" | "no_show",
) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    await updateAppointmentStatus(businessId, bookingId, status);
    revalidatePath("/dashboard/appointments");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getGoogleCalendarStatusAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const status = await getGoogleCalendarStatus(businessId);
    return { success: true as const, status };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function connectGoogleCalendarStubAction(businessId: string, email?: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    if (session.role === "superadmin") {
      return { success: false as const, error: "Superadmin cannot connect tenant calendars" };
    }
    const result = await connectGoogleCalendarStub(businessId, email);
    if (!result.ok) return { success: false as const, error: result.error };
    revalidatePath("/dashboard/integrations/google");
    revalidatePath("/dashboard/appointments");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function disconnectGoogleCalendarAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const result = await disconnectGoogleCalendar(businessId);
    if (!result.ok) return { success: false as const, error: result.error };
    revalidatePath("/dashboard/integrations/google");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
