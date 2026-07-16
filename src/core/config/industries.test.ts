import { describe, expect, it } from "vitest";
import {
  industryToLegacyVertical,
  isCommerceAllowedForIndustry,
  isCreatorPartnerEligible,
  isPresenceIndustry,
  isSalesEnabledForIndustry,
  resolveIndustryGroup,
  selectableIndustries,
} from "./industries";
import { charm99, hasModuleSku, modulesForIndustry, yearlyFromMonthly } from "./modules";
import {
  canAcceptOrders,
  canExposeStorefront,
  canShowCommerceEditor,
  canShowPackagesEditor,
} from "../utils/industry-gates";

describe("industry registry", () => {
  it("maps legacy verticals to groups", () => {
    expect(resolveIndustryGroup("salon")).toBe("salon_beauty");
    expect(resolveIndustryGroup("ecommerce")).toBe("retail");
    expect(resolveIndustryGroup("presence")).toBe("presence");
    expect(resolveIndustryGroup("clinic")).toBe("bookings");
  });

  it("blocks sales for presence", () => {
    expect(isSalesEnabledForIndustry("presence")).toBe(false);
    expect(isCommerceAllowedForIndustry("presence")).toBe(false);
    expect(isPresenceIndustry("presence")).toBe(true);
  });

  it("allows commerce for retail/salon", () => {
    expect(isCommerceAllowedForIndustry("ecommerce")).toBe(true);
    expect(isSalesEnabledForIndustry("salon")).toBe(true);
  });

  it("maps industry type to legacy vertical", () => {
    expect(industryToLegacyVertical("presence", "influencer_creator")).toBe("presence");
    expect(industryToLegacyVertical("salon_beauty", "salon")).toBe("salon");
  });

  it("marks influencer as Creator Partner eligible", () => {
    expect(isCreatorPartnerEligible("presence", "influencer_creator")).toBe(true);
    expect(isCreatorPartnerEligible("presence", "business_profile_only")).toBe(false);
  });

  it("exposes presence in selectable industries", () => {
    const groups = selectableIndustries().map((i) => i.group);
    expect(groups).toContain("presence");
    expect(groups).not.toContain("finance_insurance_loans");
  });
});

describe("module catalog", () => {
  it("lists presence core modules", () => {
    const skus = modulesForIndustry("presence").map((m) => m.sku);
    expect(skus).toContain("pr.presence_core");
    expect(skus).toContain("pr.link_stack");
    expect(skus).toContain("pr.share_kit");
  });

  it("lists salon appointments modules", () => {
    const skus = modulesForIndustry("salon_beauty").map((m) => m.sku);
    expect(skus).toContain("book.appointments_core");
    expect(skus).toContain("sb.packages");
    expect(skus).toContain("sb.staff_roster");
  });

  it("lists food menu display module", () => {
    const skus = modulesForIndustry("food").map((m) => m.sku);
    expect(skus).toContain("food.menu_display");
  });

  it("lists retail storefront module", () => {
    const skus = modulesForIndustry("retail").map((m) => m.sku);
    expect(skus).toContain("retail.storefront");
  });

  it("bookings and RE defaults ship core modules", () => {
    expect(modulesForIndustry("bookings").map((m) => m.sku)).toContain("book.appointments_core");
    expect(modulesForIndustry("real_estate").map((m) => m.sku)).toContain("re.property_bank");
  });

  it("education ships courses and youtube modules", () => {
    const skus = modulesForIndustry("education").map((m) => m.sku);
    expect(skus).toContain("edu.courses");
    expect(skus).toContain("edu.media_youtube");
    expect(skus).toContain("edu.enquiry");
  });

  it("fitness ships trial booking and memberships", () => {
    const skus = modulesForIndustry("fitness").map((m) => m.sku);
    expect(skus).toContain("fit.trial_booking");
    expect(skus).toContain("fit.memberships");
    expect(skus).toContain("book.appointments_core");
  });

  it("automotive ships vehicle listings and leads", () => {
    const skus = modulesForIndustry("automotive").map((m) => m.sku);
    expect(skus).toContain("auto.vehicle_listings");
    expect(skus).toContain("auto.leads");
  });

  it("hasModuleSku works", () => {
    expect(hasModuleSku(["pr.gallery", "pr.contact"], "pr.gallery")).toBe(true);
    expect(hasModuleSku(["pr.gallery"], "pr.media_kit")).toBe(false);
  });

  it("charm99 ends in 99", () => {
    expect(charm99(1000) % 100).toBe(99);
    expect(yearlyFromMonthly(199) % 100).toBe(99);
  });
});

describe("industry gates", () => {
  it("blocks storefront and orders for presence", () => {
    const p = { vertical: "presence" };
    expect(canExposeStorefront(p)).toBe(false);
    expect(canAcceptOrders(p)).toBe(false);
    expect(canShowCommerceEditor(p)).toBe(false);
    expect(canShowPackagesEditor(p)).toBe(false);
  });

  it("allows storefront for ecommerce", () => {
    expect(canExposeStorefront({ vertical: "ecommerce" })).toBe(true);
  });

  it("allows packages for salon only", () => {
    expect(canShowPackagesEditor({ vertical: "salon" })).toBe(true);
    expect(canShowPackagesEditor({ vertical: "ecommerce" })).toBe(false);
  });
});
