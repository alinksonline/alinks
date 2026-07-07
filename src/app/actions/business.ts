"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";
import { STANDARD_PAGE_SLUGS } from "@/core/constants/legal";
import { MAX_PAGES_PER_BUSINESS } from "@/core/constants/limits";
import type { BrandingConfig, PageContent, SiteTemplateId, ThemeConfig } from "@/core/types/page";
import { isValidHandle, normalizeHandle } from "@/core/utils/slug";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership, getBusinessForTenant } from "@/platform/business/require-business";
import { recordLegalAcceptance } from "@/platform/legal/acceptances";
import { evaluatePublishGate } from "@/platform/legal/publish-gate";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, pages, tenants } from "@/platform/db/schema";
import { SITE_TEMPLATES } from "@/tenant/templates";

const PAGE_TITLES: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  contact: "Contact",
  legal: "Terms & Privacy",
};

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

export async function completeOnboardingAction(input: {
  businessName: string;
  handle: string;
  vertical: string;
  templateId: SiteTemplateId;
  acceptTos: boolean;
  acceptPrivacy: boolean;
  acceptAup: boolean;
}) {
  try {
    const session = await requireSession();
    if (!input.acceptTos || !input.acceptPrivacy || !input.acceptAup) {
      return { success: false as const, error: "All legal checkboxes are required" };
    }

    const handle = normalizeHandle(input.handle);
    if (!isValidHandle(handle)) {
      return { success: false as const, error: "Invalid or reserved handle" };
    }

    const existing = await getBusinessForTenant(session.userId);
    if (existing) {
      return { success: false as const, error: "Business already exists" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const handleTaken = await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1);
    if (handleTaken[0]) return { success: false as const, error: "Handle already taken" };

    const template = SITE_TEMPLATES[input.templateId] ?? SITE_TEMPLATES.general;
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await db
      .update(tenants)
      .set({ tier: "pro", status: "trial", trialEndsAt, updatedAt: new Date() })
      .where(eq(tenants.id, session.userId));

    const meta = await requestMeta();
    await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.PLATFORM_TOS, ...meta });
    await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.PLATFORM_PRIVACY, ...meta });
    await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.PLATFORM_AUP, ...meta });

    const [business] = await db
      .insert(businesses)
      .values({
        tenantId: session.userId,
        handle,
        name: input.businessName.trim(),
        vertical: input.vertical,
        templateId: input.templateId,
        theme: template.theme,
        branding: { businessName: input.businessName.trim(), logoUrl: "", faviconUrl: "", coverUrl: "" },
      })
      .returning();

    const pageRows = STANDARD_PAGE_SLUGS.map((slug) => ({
      businessId: business.id,
      slug,
      title: PAGE_TITLES[slug],
      content: template.pages[slug] ?? { blocks: [] },
      isPublished: slug === "home",
    }));

    if (pageRows.length > MAX_PAGES_PER_BUSINESS) {
      return { success: false as const, error: "Page limit exceeded" };
    }

    await db.insert(pages).values(pageRows);

    revalidatePath("/dashboard");
    revalidatePath("/editor");
    return { success: true as const, handle };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Onboarding failed" };
  }
}

export async function savePageContentAction(businessId: string, slug: string, content: PageContent) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const existing = await db
      .select()
      .from(pages)
      .where(and(eq(pages.businessId, businessId), eq(pages.slug, slug)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(pages)
        .set({ content, updatedAt: new Date() })
        .where(eq(pages.id, existing[0].id));
    } else {
      await db.insert(pages).values({
        businessId,
        slug,
        title: PAGE_TITLES[slug] ?? slug,
        content,
      });
    }

    revalidatePath("/editor");
    revalidatePath(`/${(await assertBusinessOwnership(businessId, session.userId)).handle}`);
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function publishPageAction(businessId: string, slug: string, publish: boolean) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(pages)
      .set({ isPublished: publish, updatedAt: new Date() })
      .where(and(eq(pages.businessId, businessId), eq(pages.slug, slug)));

    revalidatePath("/editor");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Publish failed" };
  }
}

export async function updateThemeAction(businessId: string, theme: ThemeConfig) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.update(businesses).set({ theme, updatedAt: new Date() }).where(eq(businesses.id, businessId));
    revalidatePath("/editor/theme");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Theme update failed" };
  }
}

export async function updateBrandingAction(businessId: string, branding: BrandingConfig) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.update(businesses).set({ branding, updatedAt: new Date() }).where(eq(businesses.id, businessId));
    revalidatePath("/editor/branding");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Branding update failed" };
  }
}

export async function publishWebsiteAction(businessId: string, confirmTenantLegal: boolean) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);

    if (!confirmTenantLegal) {
      return { success: false as const, error: "Confirm tenant Terms & Privacy are published" };
    }

    const meta = await requestMeta();
    await recordLegalAcceptance({
      tenantId: session.userId,
      docType: LEGAL_DOC_TYPES.TENANT_TOS_PUBLISHED,
      ...meta,
    });
    await recordLegalAcceptance({
      tenantId: session.userId,
      docType: LEGAL_DOC_TYPES.TENANT_PRIVACY_PUBLISHED,
      ...meta,
    });

    const gate = await evaluatePublishGate(session.userId);
    if (!gate.ok) {
      return { success: false as const, error: gate.blockers.join("; ") };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(businesses)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    const business = await assertBusinessOwnership(businessId, session.userId);
    revalidatePath("/editor");
    revalidatePath(`/${business.handle}`);
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Publish failed" };
  }
}

export async function connectGoogleSheetAction(businessId: string, spreadsheetId: string) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(businesses)
      .set({ googleSpreadsheetId: spreadsheetId.trim(), updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    const meta = await requestMeta();
    await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.GOOGLE_CONNECT, ...meta });

    revalidatePath("/editor/commerce");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Connect failed" };
  }
}