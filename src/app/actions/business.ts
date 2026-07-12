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

export type OnboardingInput = {
  businessName: string;
  handle: string;
  vertical: string;
  templateId: SiteTemplateId;
  businessPurpose?: string;
  acceptTos: boolean;
  acceptPrivacy: boolean;
  acceptAup: boolean;
};

/**
 * Create the tenant's first business. Prefer this when the tenant id is already
 * known (e.g. signup just created a session — cookie is not readable until the
 * next request in Next.js Server Actions).
 */
export async function completeOnboardingForTenant(tenantId: string, input: OnboardingInput) {
  if (!input.acceptTos || !input.acceptPrivacy || !input.acceptAup) {
    return { success: false as const, error: "All legal checkboxes are required" };
  }

  const db = getPlatformDb();
  if (!db) return { success: false as const, error: "Database not connected" };

  // Exclusive roles: superadmin is not a platform client and must not own tenant sites.
  const account = (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0];
  if (!account) return { success: false as const, error: "Account not found" };
  if (account.role === "superadmin") {
    return {
      success: false as const,
      error: "Superadmin accounts cannot be tenants. Use a separate client account for a business site.",
    };
  }

  const handle = normalizeHandle(input.handle);
  if (!isValidHandle(handle)) {
    return { success: false as const, error: "Invalid or reserved handle" };
  }

  const existing = await getBusinessForTenant(tenantId);
  if (existing) {
    return { success: false as const, error: "Business already exists" };
  }

  const handleTaken = await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1);
  if (handleTaken[0]) return { success: false as const, error: "Handle already taken" };

  const template = SITE_TEMPLATES[input.templateId] ?? SITE_TEMPLATES.general;
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await db
    .update(tenants)
    .set({ tier: "pro", status: "trial", trialEndsAt, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  const meta = await requestMeta();
  await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_TOS, ...meta });
  await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_PRIVACY, ...meta });
  await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_AUP, ...meta });

  const regulatedVerticals = new Set(["clinic", "pharmacy"]);
  const gateStatus = regulatedVerticals.has(input.vertical) ? "pending_review" : "approved";

  const [business] = await db
    .insert(businesses)
    .values({
      tenantId,
      handle,
      name: input.businessName.trim(),
      vertical: input.vertical,
      templateId: input.templateId,
      verticalGateStatus: gateStatus,
      theme: template.theme,
      seoMeta: input.businessPurpose
        ? { signupPurpose: input.businessPurpose.trim(), signupAt: new Date().toISOString() }
        : {},
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
}

export async function completeOnboardingAction(input: OnboardingInput) {
  try {
    const session = await requireSession();
    return await completeOnboardingForTenant(session.userId, input);
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
    const business = await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    // Going public requires the business site flag — page-only publish is not enough.
    if (publish && !business.isPublished) {
      return {
        success: false as const,
        error: "SITE_NOT_LIVE",
        code: "SITE_NOT_LIVE" as const,
      };
    }

    await db
      .update(pages)
      .set({ isPublished: publish, updatedAt: new Date() })
      .where(and(eq(pages.businessId, businessId), eq(pages.slug, slug)));

    revalidatePath("/editor");
    revalidatePath(`/${business.handle}`);
    revalidatePath(`/${business.handle}/${slug}`);
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
    revalidatePath("/editor/business");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Branding update failed" };
  }
}

/** Step 1 — Business profile (identity + contact + social handles). Source of truth for header/footer/contact. */
export async function updateBusinessProfileAction(
  businessId: string,
  profileInput: import("@/core/types/business-profile").BusinessProfile,
) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    if (session.role === "superadmin") {
      return { success: false as const, error: "Superadmin cannot edit tenant business profile" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const { normalizeProfileForSave } = await import("@/core/utils/business-profile");
    const { parseBusinessProfile } = await import("@/core/types/business-profile");

    const existing = (
      await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
    )[0];
    if (!existing) return { success: false as const, error: "Business not found" };

    const prev = parseBusinessProfile(existing.branding, existing.name);
    const next = normalizeProfileForSave({
      ...prev,
      ...profileInput,
      socials: { ...prev.socials, ...profileInput.socials },
    });

    if (!next.businessName || next.businessName.length < 2) {
      return { success: false as const, error: "Business name is required" };
    }

    // Persist full profile in branding jsonb + sync display name column
    await db
      .update(businesses)
      .set({
        name: next.businessName,
        branding: next,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    revalidatePath("/editor/business");
    revalidatePath("/editor/branding");
    revalidatePath("/editor");
    revalidatePath(`/${existing.handle}`);
    return { success: true as const, profile: next };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Profile update failed" };
  }
}

/**
 * Make the whole mini-site public:
 * - log tenant Terms/Privacy confirmation
 * - pass publish gates
 * - set business.isPublished
 * - publish all standard pages (so /handle actually shows content)
 */
export async function publishWebsiteAction(businessId: string, confirmTenantLegal: boolean) {
  try {
    const session = await requireSession();
    const owned = await assertBusinessOwnership(businessId, session.userId);

    if (!confirmTenantLegal) {
      return { success: false as const, error: "Confirm tenant Terms & Privacy are published" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const meta = await requestMeta();
    const tenantId = session.userId;

    // Defensive: onboarding should have logged platform legal; backfill if missing
    // so tenants who signed up before a bug aren't permanently stuck.
    const gatePre = await evaluatePublishGate(tenantId, { requireTenantLegalLogged: false });
    if (gatePre.blockerKeys.includes(LEGAL_DOC_TYPES.PLATFORM_TOS)) {
      await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_TOS, ...meta });
    }
    if (gatePre.blockerKeys.includes(LEGAL_DOC_TYPES.PLATFORM_PRIVACY)) {
      await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_PRIVACY, ...meta });
    }

    await recordLegalAcceptance({
      tenantId,
      docType: LEGAL_DOC_TYPES.TENANT_TOS_PUBLISHED,
      ...meta,
    });
    await recordLegalAcceptance({
      tenantId,
      docType: LEGAL_DOC_TYPES.TENANT_PRIVACY_PUBLISHED,
      ...meta,
    });

    const gate = await evaluatePublishGate(tenantId);
    if (!gate.ok) {
      return { success: false as const, error: gate.blockers.join("; ") };
    }

    await db
      .update(businesses)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    // Public routes require page.isPublished too — flip all pages for this site.
    await db
      .update(pages)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(pages.businessId, businessId));

    const handle = owned.handle;
    revalidatePath("/dashboard");
    revalidatePath("/editor");
    revalidatePath("/editor/publish");
    revalidatePath(`/${handle}`);
    for (const s of STANDARD_PAGE_SLUGS) {
      revalidatePath(`/${handle}/${s}`);
    }
    return { success: true as const, handle };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Publish failed" };
  }
}

/** Take the mini-site offline (business flag). Pages stay ready for republish. */
export async function unpublishWebsiteAction(businessId: string) {
  try {
    const session = await requireSession();
    const owned = await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(businesses)
      .set({ isPublished: false, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));

    const handle = owned.handle;
    revalidatePath("/dashboard");
    revalidatePath("/editor");
    revalidatePath("/editor/publish");
    revalidatePath(`/${handle}`);
    for (const s of STANDARD_PAGE_SLUGS) {
      revalidatePath(`/${handle}/${s}`);
    }
    return { success: true as const, handle };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Unpublish failed" };
  }
}

function extractSpreadsheetId(input: string): string {
  const raw = input.trim();
  const fromUrl = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl?.[1]) return fromUrl[1];
  return raw.replace(/[?#].*$/, "");
}

/** Link an existing Google Spreadsheet (must be shared with the ALINKS service account). */
export async function connectGoogleSheetAction(businessId: string, spreadsheetIdOrUrl: string) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    if (session.role === "superadmin") {
      return { success: false as const, error: "Superadmin cannot connect tenant Sheets" };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
    if (!spreadsheetId || spreadsheetId.length < 10) {
      return { success: false as const, error: "Paste a valid Google Spreadsheet ID or full URL" };
    }

    const { isGoogleSheetsConfigured } = await import("@/tenant/storage/google-auth");
    const { verifySpreadsheetAccess } = await import("@/tenant/storage/google-sheets-adapter");

    if (isGoogleSheetsConfigured() && !spreadsheetId.startsWith("dev-")) {
      const check = await verifySpreadsheetAccess(spreadsheetId);
      if (!check.ok) {
        return {
          success: false as const,
          error:
            check.error ??
            "Cannot access this spreadsheet. Share it as Editor with the ALINKS service account email.",
        };
      }
    }

    await db
      .update(businesses)
      .set({
        googleSpreadsheetId: spreadsheetId,
        storageBackend: "google_sheets",
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    const meta = await requestMeta();
    await recordLegalAcceptance({ tenantId: session.userId, docType: LEGAL_DOC_TYPES.GOOGLE_CONNECT, ...meta });

    revalidatePath("/editor/commerce");
    return {
      success: true as const,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Connect failed" };
  }
}

/** Create a new ALINKS workbook in Google Drive (service account) and share with the tenant email. */
export async function provisionGoogleSheetAction(businessId: string, acceptDataAddendum: boolean) {
  try {
    const session = await requireSession();
    const business = await assertBusinessOwnership(businessId, session.userId);
    if (session.role === "superadmin") {
      return { success: false as const, error: "Superadmin cannot provision tenant Sheets" };
    }
    if (!acceptDataAddendum) {
      return {
        success: false as const,
        error: "Confirm that customer data will be stored in Google Sheets (your business data ownership)",
      };
    }

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const { isGoogleSheetsConfigured, getServiceAccountEmail } = await import("@/tenant/storage/google-auth");
    if (!isGoogleSheetsConfigured()) {
      return {
        success: false as const,
        error:
          "Google Sheets is not configured on the server (GOOGLE_SERVICE_ACCOUNT_JSON). Contact support or use STORAGE_DEV_MODE for local testing.",
      };
    }

    const tenant = (await db.select().from(tenants).where(eq(tenants.id, session.userId)).limit(1))[0];
    const { provisionTenantWorkbook } = await import("@/tenant/storage/google-sheets-adapter");
    const workbook = await provisionTenantWorkbook({
      businessName: business.name,
      handle: business.handle,
      shareWithEmail: tenant?.email && !tenant.email.endsWith("@alinks.local") ? tenant.email : undefined,
    });

    await db
      .update(businesses)
      .set({
        googleSpreadsheetId: workbook.spreadsheetId,
        storageBackend: "google_sheets",
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    const meta = await requestMeta();
    await recordLegalAcceptance({
      tenantId: session.userId,
      docType: LEGAL_DOC_TYPES.GOOGLE_CONNECT,
      metadata: { spreadsheetId: workbook.spreadsheetId, provisioned: true },
      ...meta,
    });

    revalidatePath("/editor/commerce");
    return {
      success: true as const,
      spreadsheetId: workbook.spreadsheetId,
      spreadsheetUrl: workbook.spreadsheetUrl,
      serviceAccountEmail: getServiceAccountEmail(),
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Could not create spreadsheet" };
  }
}

export async function getStorageStatusAction(businessId: string) {
  try {
    const session = await requireSession();
    await assertBusinessOwnership(businessId, session.userId);
    const { resolveStorageBackend } = await import("@/tenant/storage/get-adapter");
    const { isGoogleSheetsConfigured, getServiceAccountEmail } = await import("@/tenant/storage/google-auth");
    const resolved = await resolveStorageBackend(businessId);
    return {
      success: true as const,
      ...resolved,
      googleConfigured: isGoogleSheetsConfigured(),
      serviceAccountEmail: getServiceAccountEmail(),
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Status failed" };
  }
}