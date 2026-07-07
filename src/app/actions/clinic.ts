"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, clinicLicenses } from "@/platform/db/schema";

export async function submitClinicLicenseAction(input: {
  businessId: string;
  licenseNumber: string;
  doctorName: string;
  documentUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.insert(clinicLicenses).values({
      businessId: input.businessId,
      licenseNumber: input.licenseNumber.trim(),
      doctorName: input.doctorName.trim(),
      documentUrl: input.documentUrl ?? null,
      status: "pending",
    });

    await db
      .update(businesses)
      .set({ verticalGateStatus: "pending", updatedAt: new Date() })
      .where(eq(businesses.id, input.businessId));

    revalidatePath("/editor/clinic");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function reviewClinicLicenseAction(licenseId: string, approve: boolean) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  const license = (await db.select().from(clinicLicenses).where(eq(clinicLicenses.id, licenseId)).limit(1))[0];
  if (!license) return { success: false as const, error: "Not found" };

  const status = approve ? "approved" : "rejected";
  await db
    .update(clinicLicenses)
    .set({ status, reviewedAt: new Date() })
    .where(eq(clinicLicenses.id, licenseId));

  await db
    .update(businesses)
    .set({ verticalGateStatus: status, updatedAt: new Date() })
    .where(eq(businesses.id, license.businessId));

  revalidatePath("/superadmin");
  return { success: true as const };
}

export async function getPendingClinicLicenses() {
  const db = getPlatformDb();
  if (!db) return [];
  return db.select().from(clinicLicenses).where(eq(clinicLicenses.status, "pending"));
}

export async function approvePharmacyOtcAction(businessId: string) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") return { success: false as const, error: "Unauthorized" };

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  await db
    .update(businesses)
    .set({ pharmacyOtcApproved: true, verticalGateStatus: "approved", updatedAt: new Date() })
    .where(eq(businesses.id, businessId));

  revalidatePath("/superadmin");
  return { success: true as const };
}