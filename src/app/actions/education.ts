"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseYoutubeUrl } from "@/core/utils/youtube";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, courses } from "@/platform/db/schema";
import { templatesForEducationType } from "@/tenant/education/course-templates";
import { writeToTenantStorage } from "@/tenant/storage/write-service";

export async function getPublicCoursesForHandle(handle: string) {
  const db = getPlatformDb();
  if (!db) return [];
  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz || !biz.isPublished) return [];
  return db
    .select()
    .from(courses)
    .where(and(eq(courses.businessId, biz.id), eq(courses.isActive, true)))
    .orderBy(asc(courses.sortOrder), asc(courses.title));
}

export async function getCoursesForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db
    .select()
    .from(courses)
    .where(eq(courses.businessId, businessId))
    .orderBy(asc(courses.sortOrder), asc(courses.title));
}

export async function seedCoursesAction(businessId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const existing = await db.select().from(courses).where(eq(courses.businessId, businessId)).limit(1);
    if (existing.length > 0) return { success: true as const, seeded: false };

    const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
    const templates = templatesForEducationType(biz?.industryType ?? "tuition");

    for (const t of templates) {
      const yt = parseYoutubeUrl(t.youtubeUrl);
      await db.insert(courses).values({
        businessId,
        title: t.title,
        description: t.description,
        subject: t.subject,
        mode: t.mode,
        feeLabel: t.feeLabel,
        feeAmount: t.feeAmount,
        youtubeUrl: yt.ok ? yt.watchUrl : null,
        youtubeVideoId: yt.ok ? yt.videoId : null,
        sortOrder: t.sortOrder,
        isActive: true,
      });
    }

    revalidatePath("/editor/courses");
    if (biz?.handle) revalidatePath(`/${biz.handle}/courses`);
    return { success: true as const, seeded: true };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Seed failed" };
  }
}

export async function addCourseAction(input: {
  businessId: string;
  title: string;
  subject: string;
  feeLabel?: string;
  description?: string;
  youtubeUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const title = input.title.trim();
    if (title.length < 2) return { success: false as const, error: "Title required" };

    let youtubeUrl: string | null = null;
    let youtubeVideoId: string | null = null;
    if (input.youtubeUrl?.trim()) {
      const yt = parseYoutubeUrl(input.youtubeUrl);
      if (!yt.ok) return { success: false as const, error: yt.error };
      youtubeUrl = yt.watchUrl;
      youtubeVideoId = yt.videoId;
    }

    await db.insert(courses).values({
      businessId: input.businessId,
      title,
      description: input.description?.trim() || null,
      subject: input.subject.trim() || "General",
      feeLabel: input.feeLabel?.trim() || null,
      youtubeUrl,
      youtubeVideoId,
      isActive: true,
      sortOrder: 50,
    });

    revalidatePath("/editor/courses");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateCourseAction(input: {
  businessId: string;
  courseId: string;
  isActive?: boolean;
  youtubeUrl?: string | null;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const row = (
      await db
        .select()
        .from(courses)
        .where(and(eq(courses.id, input.courseId), eq(courses.businessId, input.businessId)))
        .limit(1)
    )[0];
    if (!row) return { success: false as const, error: "Not found" };

    let youtubeUrl = row.youtubeUrl;
    let youtubeVideoId = row.youtubeVideoId;
    if (input.youtubeUrl !== undefined) {
      if (!input.youtubeUrl?.trim()) {
        youtubeUrl = null;
        youtubeVideoId = null;
      } else {
        const yt = parseYoutubeUrl(input.youtubeUrl);
        if (!yt.ok) return { success: false as const, error: yt.error };
        youtubeUrl = yt.watchUrl;
        youtubeVideoId = yt.videoId;
      }
    }

    await db
      .update(courses)
      .set({
        isActive: input.isActive ?? row.isActive,
        youtubeUrl,
        youtubeVideoId,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, input.courseId));

    revalidatePath("/editor/courses");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteCourseAction(businessId: string, courseId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };
    await db.delete(courses).where(and(eq(courses.id, courseId), eq(courses.businessId, businessId)));
    revalidatePath("/editor/courses");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Free enquiry / demo interest → tenant Sheets (not platform PII store). */
export async function submitCourseEnquiryAction(input: {
  handle: string;
  courseId?: string;
  courseTitle?: string;
  name: string;
  phone: string;
  message?: string;
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const biz = (
      await db.select().from(businesses).where(eq(businesses.handle, input.handle)).limit(1)
    )[0];
    if (!biz || !biz.isPublished) return { success: false as const, error: "Not found" };

    const name = input.name.trim();
    const phone = input.phone.replace(/\D/g, "").slice(0, 15);
    if (name.length < 2 || phone.length < 10) {
      return { success: false as const, error: "Name and 10-digit phone required" };
    }

    await writeToTenantStorage(biz.id, "Customers", {
      leadType: "education_enquiry",
      courseId: input.courseId ?? "",
      courseTitle: input.courseTitle ?? "",
      customerName: name,
      customerPhone: phone,
      message: input.message?.trim() ?? "",
      channel: "web",
      createdAt: new Date().toISOString(),
    });

    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
