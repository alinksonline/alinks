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
  /** Legacy vertical or derived from industry. */
  vertical: string;
  /** Industry group e.g. presence, salon_beauty. */
  industryGroup?: string;
  /** Industry type e.g. influencer_creator. */
  industryType?: string;
  templateId: SiteTemplateId;
  businessPurpose?: string;
  acceptTos: boolean;
  acceptPrivacy: boolean;
  acceptAup: boolean;
  /** Creator Partner terms (Presence influencer deep discount). */
  acceptCreatorPartner?: boolean;
  creatorPartnerTier?: "A" | "B" | "C" | "D";
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

  const {
    defaultIndustryType,
    industryToLegacyVertical,
    isCreatorPartnerEligible,
    resolveIndustryGroup,
    CREATOR_PARTNER_TIERS,
  } = await import("@/core/config/industries");

  const industryGroup = resolveIndustryGroup(input.industryGroup || input.vertical);
  const industryType = input.industryType || defaultIndustryType(input.vertical);
  const vertical = industryToLegacyVertical(industryGroup, industryType);

  const creatorEligible = isCreatorPartnerEligible(industryGroup, industryType);
  if (creatorEligible && input.acceptCreatorPartner && !input.creatorPartnerTier) {
    return { success: false as const, error: "Choose a Creator Partner tier" };
  }
  if (input.acceptCreatorPartner && !creatorEligible) {
    return { success: false as const, error: "Creator Partner is only for the influencer path" };
  }

  const resolvedTemplateId =
    industryGroup === "presence"
      ? ("presence" as SiteTemplateId)
      : industryGroup === "food"
        ? ("food" as SiteTemplateId)
        : industryGroup === "bookings"
          ? ("bookings" as SiteTemplateId)
          : industryGroup === "real_estate"
            ? ("real_estate" as SiteTemplateId)
            : industryGroup === "education"
              ? ("education" as SiteTemplateId)
              : industryGroup === "fitness"
                ? ("fitness" as SiteTemplateId)
                : industryGroup === "automotive"
                  ? ("automotive" as SiteTemplateId)
                  : input.templateId;
  const template = SITE_TEMPLATES[resolvedTemplateId] ?? SITE_TEMPLATES.general;
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await db
    .update(tenants)
    .set({ tier: "pro", status: "trial", trialEndsAt, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  const meta = await requestMeta();
  await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_TOS, ...meta });
  await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_PRIVACY, ...meta });
  await recordLegalAcceptance({ tenantId, docType: LEGAL_DOC_TYPES.PLATFORM_AUP, ...meta });

  const { isClinicLicenseGated } = await import("@/core/config/industries");
  const regulatedVerticals = new Set(["clinic", "pharmacy"]);
  const clinicGated = isClinicLicenseGated(industryType, vertical);
  const gateStatus =
    clinicGated || regulatedVerticals.has(vertical) ? "pending_review" : "approved";

  const partnerTier = input.acceptCreatorPartner && input.creatorPartnerTier
    ? CREATOR_PARTNER_TIERS[input.creatorPartnerTier]
    : null;

  if (partnerTier) {
    await recordLegalAcceptance({
      tenantId,
      docType: LEGAL_DOC_TYPES.CREATOR_PARTNER,
      metadata: {
        tier: partnerTier.code,
        industryType,
        discountPctMonthly: partnerTier.discountPctMonthly,
        discountPctYearly: partnerTier.discountPctYearly,
      },
      ...meta,
    });
  }

  const [business] = await db
    .insert(businesses)
    .values({
      tenantId,
      handle,
      name: input.businessName.trim(),
      vertical,
      industryGroup,
      industryType,
      templateId: resolvedTemplateId,
      verticalGateStatus: gateStatus,
      theme: template.theme,
      creatorPartnerTier: partnerTier?.code ?? null,
      creatorPartnerAcceptedAt: partnerTier ? new Date() : null,
      creatorDiscountPctMonthly: partnerTier?.discountPctMonthly ?? null,
      creatorDiscountPctYearly: partnerTier?.discountPctYearly ?? null,
      seoMeta: input.businessPurpose
        ? { signupPurpose: input.businessPurpose.trim(), signupAt: new Date().toISOString() }
        : {},
      branding: { businessName: input.businessName.trim(), logoUrl: "", faviconUrl: "", coverUrl: "" },
    })
    .returning();

  const presenceTitles: Record<string, string> = {
    home: "Home",
    about: "About",
    services: "Links",
    contact: "Contact",
    legal: "Terms & Privacy",
  };
  const titles = industryGroup === "presence" ? presenceTitles : PAGE_TITLES;

  const pageRows = STANDARD_PAGE_SLUGS.map((slug) => ({
    businessId: business.id,
    slug,
    title: titles[slug] ?? PAGE_TITLES[slug],
    content: template.pages[slug] ?? { blocks: [] },
    isPublished: slug === "home",
  }));

  if (pageRows.length > MAX_PAGES_PER_BUSINESS) {
    return { success: false as const, error: "Page limit exceeded" };
  }

  await db.insert(pages).values(pageRows);

  // Grant default industry modules (Presence core free modules, etc.)
  const { grantDefaultModules } = await import("@/platform/billing/entitlements");
  await grantDefaultModules(business.id, industryGroup, "onboarding");

  // Salon: seed package templates so public /book works immediately after publish
  if (industryGroup === "salon_beauty") {
    try {
      const { SALON_PACKAGE_TEMPLATES } = await import("@/tenant/salon/package-templates");
      const { salonPackages } = await import("@/platform/db/schema");
      await db.insert(salonPackages).values(
        SALON_PACKAGE_TEMPLATES.map((t) => ({
          businessId: business.id,
          name: t.name,
          description: t.description,
          price: t.price,
          durationMinutes: t.durationMinutes,
          category: t.category,
          isActive: t.isActive,
          paymentMode: "pay_at_salon" as const,
        })),
      );
    } catch {
      // Non-fatal — tenant can seed from editor
    }
  }

  // Food Layer 1: seed digital menu for WhatsApp ordering
  if (industryGroup === "food") {
    try {
      const { resolveFoodType } = await import("@/core/config/food-compat");
      const { FOOD_MENU_TEMPLATES, CATERING_MENU_TEMPLATES } = await import(
        "@/tenant/food/menu-templates"
      );
      const { menuItems } = await import("@/platform/db/schema");
      const foodType = resolveFoodType(industryType, vertical);
      const templates =
        foodType === "catering_only" ? CATERING_MENU_TEMPLATES : FOOD_MENU_TEMPLATES;
      await db.insert(menuItems).values(
        templates.map((t) => ({
          businessId: business.id,
          name: t.name,
          description: t.description,
          section: t.section,
          price: t.price,
          isVeg: t.isVeg,
          sortOrder: t.sortOrder,
          isAvailable: true,
        })),
      );
    } catch {
      // Non-fatal
    }
  }

  // Automotive: vehicles (dealers) / services (workshop) / parts (retail)
  if (industryGroup === "automotive") {
    try {
      const { automotiveSeedProfile } = await import("@/core/config/automotive");
      const profile = automotiveSeedProfile(industryType);
      if (profile.vehicles) {
        const { vehicleTemplatesForType } = await import("@/tenant/automotive/vehicle-templates");
        const { vehicleListings } = await import("@/platform/db/schema");
        const templates = vehicleTemplatesForType(industryType);
        await db.insert(vehicleListings).values(
          templates.map((t) => ({
            businessId: business.id,
            title: t.title,
            description: t.description,
            condition: t.condition,
            visibility: t.visibility,
            make: t.make,
            model: t.model,
            year: t.year,
            fuel: t.fuel,
            kmDriven: t.kmDriven,
            priceLabel: t.priceLabel,
            priceAmount: t.priceAmount,
            city: t.city,
            sortOrder: t.sortOrder,
            isActive: true,
          })),
        );
      }
      if (profile.services) {
        const { serviceTemplatesForAutoType } = await import(
          "@/tenant/automotive/service-templates"
        );
        const { salonPackages } = await import("@/platform/db/schema");
        const templates = serviceTemplatesForAutoType(industryType);
        await db.insert(salonPackages).values(
          templates.map((t) => ({
            businessId: business.id,
            name: t.name,
            description: t.description,
            price: t.price,
            durationMinutes: t.durationMinutes,
            category: t.category,
            isActive: true,
            paymentMode: t.paymentMode,
            capacity: t.capacity,
          })),
        );
      }
      if (profile.parts) {
        const { RETAIL_PRODUCT_TEMPLATES } = await import("@/tenant/retail/product-templates");
        const { storeProducts } = await import("@/platform/db/schema");
        // Seed a few accessory-like products for parts shops
        const parts = RETAIL_PRODUCT_TEMPLATES.filter((t) =>
          ["Electronics", "Home"].includes(t.category),
        ).slice(0, 4);
        const fallback = RETAIL_PRODUCT_TEMPLATES.slice(0, 4);
        await db.insert(storeProducts).values(
          (parts.length ? parts : fallback).map((t) => ({
            businessId: business.id,
            name: t.name,
            description: t.description,
            price: t.price,
            mrp: t.mrp ?? null,
            category: "Parts",
            brand: t.brand ?? null,
            sku: t.sku,
            stock: t.stock,
            sortOrder: t.sortOrder,
            isActive: true,
          })),
        );
      }
    } catch {
      // Non-fatal
    }
  }

  // Fitness: memberships / classes / PT + free trial book
  if (industryGroup === "fitness") {
    try {
      const { templatesForFitnessType } = await import("@/tenant/fitness/package-templates");
      const { salonPackages } = await import("@/platform/db/schema");
      const templates = templatesForFitnessType(industryType);
      await db.insert(salonPackages).values(
        templates.map((t) => ({
          businessId: business.id,
          name: t.name,
          description: t.description,
          price: t.price,
          durationMinutes: t.durationMinutes,
          category: t.category,
          isActive: true,
          paymentMode: t.paymentMode,
          capacity: t.capacity,
        })),
      );
    } catch {
      // Non-fatal
    }
  }

  // Bookings industry: seed services (clinic / consult / legal / venue)
  if (industryGroup === "bookings") {
    try {
      const { templatesForBookingType } = await import("@/tenant/bookings/service-templates");
      const { salonPackages } = await import("@/platform/db/schema");
      const templates = templatesForBookingType(industryType);
      await db.insert(salonPackages).values(
        templates.map((t) => ({
          businessId: business.id,
          name: t.name,
          description: t.description,
          price: t.price,
          durationMinutes: t.durationMinutes,
          category: t.category,
          isActive: true,
          paymentMode: t.paymentMode,
          capacity: t.capacity,
        })),
      );
    } catch {
      // Non-fatal
    }
  }

  // Education: seed courses with YouTube sample embeds
  if (industryGroup === "education") {
    try {
      const { templatesForEducationType } = await import("@/tenant/education/course-templates");
      const { parseYoutubeUrl } = await import("@/core/utils/youtube");
      const { courses } = await import("@/platform/db/schema");
      const templates = templatesForEducationType(industryType);
      for (const t of templates) {
        const yt = parseYoutubeUrl(t.youtubeUrl);
        await db.insert(courses).values({
          businessId: business.id,
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
    } catch {
      // Non-fatal
    }
  }

  // Real estate: seed sample listings
  if (industryGroup === "real_estate") {
    try {
      const { propertyListings } = await import("@/platform/db/schema");
      await db.insert(propertyListings).values([
        {
          businessId: business.id,
          title: "2 BHK sample listing",
          description: "Replace with your Property-Bank listing. Visibility: open.",
          listingType: "rent",
          visibility: "open",
          city: "Bengaluru",
          locality: "Sample area",
          priceLabel: "₹35,000 / mo",
          priceAmount: 35000,
          bedrooms: 2,
          areaSqft: 1100,
          isActive: true,
          sortOrder: 1,
        },
        {
          businessId: business.id,
          title: "Plot teaser (contact for price)",
          description: "Teaser listing — limited public detail.",
          listingType: "sell",
          visibility: "teaser",
          city: "Pune",
          locality: "Outer ring",
          priceLabel: "On request",
          bedrooms: null,
          areaSqft: 2400,
          isActive: true,
          sortOrder: 2,
        },
      ]);
    } catch {
      // Non-fatal
    }
  }

  // Retail storefront: seed products + trade mode retail
  if (industryGroup === "retail") {
    try {
      const { RETAIL_PRODUCT_TEMPLATES, KIRANA_PRODUCT_TEMPLATES } = await import(
        "@/tenant/retail/product-templates"
      );
      const { storeProducts } = await import("@/platform/db/schema");
      const templates =
        industryType === "kirana" || vertical === "kirana" || vertical === "grocery"
          ? KIRANA_PRODUCT_TEMPLATES
          : RETAIL_PRODUCT_TEMPLATES;
      await db
        .update(businesses)
        .set({ tradeMode: "retail", updatedAt: new Date() })
        .where(eq(businesses.id, business.id));
      await db.insert(storeProducts).values(
        templates.map((t) => ({
          businessId: business.id,
          name: t.name,
          description: t.description,
          price: t.price,
          mrp: t.mrp ?? null,
          category: t.category,
          brand: t.brand ?? null,
          sku: t.sku,
          stock: t.stock,
          sortOrder: t.sortOrder,
          isActive: true,
        })),
      );
    } catch {
      // Non-fatal
    }
  }

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
    const owned = await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db.update(businesses).set({ theme, updatedAt: new Date() }).where(eq(businesses.id, businessId));
    revalidatePath("/editor/theme");
    revalidatePath(`/${owned.handle}`);
    revalidatePath(`/${owned.handle}/store`);
    for (const s of STANDARD_PAGE_SLUGS) {
      revalidatePath(`/${owned.handle}/${s}`);
    }
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

    const { normalizeProfileForSave } = await import("@/core/utils/business-profile");
    const { parseBusinessProfile } = await import("@/core/types/business-profile");

    const existing = (
      await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
    )[0];
    if (!existing) return { success: false as const, error: "Business not found" };

    const prev = parseBusinessProfile(existing.branding, existing.name);
    const next = normalizeProfileForSave({
      ...prev,
      businessName: branding.businessName?.trim() || prev.businessName,
      tagline: branding.tagline ?? prev.tagline,
      logoUrl: branding.logoUrl ?? prev.logoUrl,
      faviconUrl: branding.faviconUrl ?? prev.faviconUrl,
      coverUrl: branding.coverUrl ?? prev.coverUrl,
      ogImageUrl: branding.ogImageUrl ?? prev.ogImageUrl,
      ogFallback: branding.ogFallback === "favicon" ? "favicon" : branding.ogFallback === "cover" ? "cover" : prev.ogFallback,
      showTitleWithLogo: branding.showTitleWithLogo ?? prev.showTitleWithLogo,
      email: branding.email ?? prev.email,
      phone: branding.phone ?? prev.phone,
      whatsapp: branding.whatsapp ?? prev.whatsapp,
      address: branding.address ?? prev.address,
      socials: {
        ...prev.socials,
        ...(branding.socials ?? {}),
      },
    });

    await db
      .update(businesses)
      .set({
        name: next.businessName || existing.name,
        branding: next,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));

    revalidatePath("/editor/branding");
    revalidatePath("/editor/business");
    revalidatePath(`/${existing.handle}`);
    revalidatePath(`/${existing.handle}/store`);
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
      industryGroup: business.industryGroup || business.vertical,
      industryType: business.industryType,
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