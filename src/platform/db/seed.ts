import { config } from "dotenv";
import { eq } from "drizzle-orm";

config();

import { getPlatformDb } from "./client";
import { adSlots, businesses, pages, promoCodes, salonPackages, staffMembers, tenants } from "./schema";
import { LAUNCH_PROMOS } from "@/platform/billing/promo";
import { SITE_TEMPLATES } from "@/tenant/templates";
import { STANDARD_PAGE_SLUGS } from "@/core/constants/legal";
import { SALON_PACKAGE_TEMPLATES } from "@/tenant/salon/package-templates";
import { seedCatalogProducts } from "@/tenant/storage/catalog";

const PAGE_TITLES: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  contact: "Contact",
  legal: "Terms & Privacy",
};

const DEMO_PRODUCTS = [
  { id: "svc-1", name: "Haircut & Styling", price: 599, category: "salon", stock: 50, sku: "HC-01" },
  { id: "svc-2", name: "Hair Colour", price: 1999, category: "salon", stock: 30, sku: "HC-02" },
  { id: "svc-3", name: "Facial Glow", price: 799, category: "beauty", stock: 40, sku: "FG-01" },
  { id: "svc-4", name: "Manicure", price: 499, category: "beauty", stock: 60, sku: "MN-01" },
];

async function seedPagesForBusiness(businessId: string, templateId: keyof typeof SITE_TEMPLATES) {
  const db = getPlatformDb();
  if (!db) return;
  const template = SITE_TEMPLATES[templateId] ?? SITE_TEMPLATES.general;

  const existingPages = await db.select().from(pages).where(eq(pages.businessId, businessId));

  for (const slug of STANDARD_PAGE_SLUGS) {
    const content = template.pages[slug] ?? { blocks: [] };
    const existing = existingPages.find((p) => p.slug === slug);
    if (existing) {
      await db
        .update(pages)
        .set({ content, isPublished: true, updatedAt: new Date() })
        .where(eq(pages.id, existing.id));
    } else {
      await db.insert(pages).values({
        businessId,
        slug,
        title: PAGE_TITLES[slug],
        content,
        isPublished: true,
      });
    }
  }
}

async function seedSalonPackages(businessId: string) {
  const db = getPlatformDb();
  if (!db) return;

  const existing = await db.select().from(salonPackages).where(eq(salonPackages.businessId, businessId)).limit(1);
  if (existing.length > 0) return;

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
}

async function seed() {
  const db = getPlatformDb();
  if (!db) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const superadminPhone = (process.env.SUPERADMIN_PHONE ?? "9999999999").replace(/\D/g, "").slice(-10);
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  console.log("Seeding ALINKS Phase 0–4...");

  let superadmin = (await db.select().from(tenants).where(eq(tenants.phone, superadminPhone)).limit(1))[0];
  if (!superadmin) {
    [superadmin] = await db
      .insert(tenants)
      .values({
        email: "benjamin@alinks.online",
        phone: superadminPhone,
        name: "Benjamin Anand",
        tier: "enterprise",
        status: "active",
      })
      .returning();
  }

  console.log("Superadmin:", superadmin.id, `(phone: ${superadminPhone})`);

  let demoTenant = (await db.select().from(tenants).where(eq(tenants.phone, "9876543210")).limit(1))[0];
  if (!demoTenant) {
    [demoTenant] = await db
      .insert(tenants)
      .values({
        email: "demo@alinks.online",
        phone: "9876543210",
        name: "Demo Tenant",
        tier: "pro",
        status: "trial",
        trialEndsAt,
      })
      .returning();
  } else {
    await db
      .update(tenants)
      .set({ tier: "pro", trialEndsAt, status: "trial" })
      .where(eq(tenants.id, demoTenant.id));
  }

  let demoBusiness = (await db.select().from(businesses).where(eq(businesses.handle, "demo")).limit(1))[0];
  if (!demoBusiness) {
    [demoBusiness] = await db
      .insert(businesses)
      .values({
        tenantId: demoTenant.id,
        handle: "demo",
        name: "Demo Salon",
        vertical: "salon",
        isPublished: true,
        templateId: "salon",
        theme: SITE_TEMPLATES.salon.theme,
        themePrimary: "#be185d",
        checkoutMode: "pro",
        codEnabled: true,
        googleSpreadsheetId: "dev-sheet-demo",
        storageBackend: "google_sheets",
      })
      .returning();
  } else {
    await db
      .update(businesses)
      .set({
        checkoutMode: "pro",
        codEnabled: true,
        googleSpreadsheetId: "dev-sheet-demo",
        metaCatalogEnabled: true,
        isPublished: true,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, demoBusiness.id));
  }

  await db
    .update(tenants)
    .set({ activeBusinessId: demoBusiness.id, aiCredits: 500, locale: "en", region: "IN" })
    .where(eq(tenants.id, demoTenant.id));

  await seedPagesForBusiness(demoBusiness.id, "salon");
  await seedSalonPackages(demoBusiness.id);
  await seedCatalogProducts(demoBusiness.id, DEMO_PRODUCTS);

  const staffExisting = await db.select().from(staffMembers).where(eq(staffMembers.businessId, demoBusiness.id)).limit(1);
  if (!staffExisting[0]) {
    await db.insert(staffMembers).values([
      { businessId: demoBusiness.id, name: "Priya", role: "stylist", slotCapacity: 2 },
      { businessId: demoBusiness.id, name: "Ravi", role: "colorist", slotCapacity: 1 },
    ]);
  }

  for (const [code, meta] of Object.entries(LAUNCH_PROMOS)) {
    const existing = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
    if (!existing[0]) {
      await db.insert(promoCodes).values({
        code,
        description: meta.description,
        discountMonths: meta.discountMonths,
        maxRedemptions: meta.maxRedemptions,
      });
    }
  }

  const adExisting = await db.select().from(adSlots).limit(1);
  if (!adExisting[0]) {
    await db.insert(adSlots).values({
      businessId: demoBusiness.id,
      advertiser: "Demo AP Kirana",
      targetUrl: "https://example.com/promo",
      placement: "tenant_footer",
      status: "pending",
    });
  }

  console.log("Demo Pro site: /demo");
  console.log("  Store: /demo/store | Book: /demo/book | Sitemap: /demo/sitemap.xml");
  console.log("  AI dashboard: /dashboard/ai | Promo: FIRST100 / FREEMONTH on /billing");
  console.log("  Meta feed: /api/meta/catalog/demo");
  console.log("  Login demo tenant: phone 9876543210, OTP from DEV_OTP");

  console.log("Seed complete.");
  process.exit(0);
}

seed();