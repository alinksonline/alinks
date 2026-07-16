/**
 * Industry + entitlement gates for editor nav, public routes, and APIs.
 * Presence = zero commerce on ALINKS.
 */

import {
  getIndustryDef,
  isBookingAllowedForIndustry,
  isClinicLicenseGated,
  isCommerceAllowedForIndustry,
  isPresenceIndustry,
  isSalesEnabledForIndustry,
  resolveIndustryGroup,
  type IndustryGroup,
} from "@/core/config/industries";
import {
  isAutoDealerType,
  isAutoPartsType,
  isAutoWorkshopType,
} from "@/core/config/automotive";
import { AUTO_PARTS_RETAIL_SKU, PAY_THEN_BOOK_SKU } from "@/core/config/module-gates";
import { hasModuleSku } from "@/core/config/modules";

export type IndustryGateInput = {
  /** Legacy vertical or industry group. */
  vertical: string;
  industryGroup?: string | null;
  industryType?: string | null;
  /** Active module SKUs for this business (from entitlements). */
  entitledSkus?: readonly string[];
  /** Clinic gate status when regulated. */
  verticalGateStatus?: string | null;
};

export function resolveGroup(input: IndustryGateInput): IndustryGroup {
  return resolveIndustryGroup(input.industryGroup || input.vertical);
}

export function salesEnabled(input: IndustryGateInput): boolean {
  return isSalesEnabledForIndustry(resolveGroup(input));
}

export function commerceAllowed(input: IndustryGateInput): boolean {
  return isCommerceAllowedForIndustry(resolveGroup(input));
}

export function bookingAllowed(input: IndustryGateInput): boolean {
  return isBookingAllowedForIndustry(resolveGroup(input));
}

export function isPresence(input: IndustryGateInput): boolean {
  return isPresenceIndustry(resolveGroup(input));
}

/** Public store / cart / checkout may mount. */
export function canExposeStorefront(input: IndustryGateInput): boolean {
  if (!commerceAllowed(input) || !salesEnabled(input)) return false;
  if (isPresence(input)) return false;
  const g = resolveGroup(input);
  if (g === "bookings" || g === "real_estate" || g === "education" || g === "fitness") {
    return false;
  }
  // Automotive: only spare-parts type uses product storefront
  if (g === "automotive") {
    if (!isAutoPartsType(input.industryType)) return false;
    // When entitlements loaded, require paid parts retail SKU
    if (input.entitledSkus !== undefined) {
      return hasModuleSku(input.entitledSkus, AUTO_PARTS_RETAIL_SKU);
    }
    return true;
  }
  return true;
}

/**
 * Public book may mount.
 * Clinic: only after license gate approved (verticalGateStatus).
 */
export function canExposeBooking(input: IndustryGateInput): boolean {
  if (!bookingAllowed(input) || !salesEnabled(input)) return false;
  if (isPresence(input)) return false;
  if (isClinicLicenseGated(input.industryType, input.vertical)) {
    // Must be explicitly approved — missing/pending/rejected all block public book
    if (input.verticalGateStatus !== "approved") {
      return false;
    }
  }
  // Auto dealers / parts shops: book only for workshop types
  if (resolveGroup(input) === "automotive" && !isAutoWorkshopType(input.industryType)) {
    return false;
  }
  return true;
}

/** API create-order / commerce writes. */
export function canAcceptOrders(input: IndustryGateInput): boolean {
  return canExposeStorefront(input);
}

/** Editor: Checkout / Packages commerce tabs. */
export function canShowCommerceEditor(input: IndustryGateInput): boolean {
  if (resolveGroup(input) === "food") return true;
  return canExposeStorefront(input);
}

/** Food digital menu editor + public /menu */
export function canShowFoodMenu(input: IndustryGateInput): boolean {
  return resolveGroup(input) === "food" || input.vertical === "restaurant";
}

/** Retail product catalog editor + public /store */
export function canShowRetailStore(input: IndustryGateInput): boolean {
  const g = resolveGroup(input);
  if (g === "retail") return true;
  if (g === "automotive" && isAutoPartsType(input.industryType)) return true;
  return ["kirana", "grocery", "ecommerce"].includes(input.vertical);
}

/** Editor: service packages (salon + bookings + fitness + auto workshop). */
export function canShowPackagesEditor(input: IndustryGateInput): boolean {
  if (!salesEnabled(input) || isPresence(input)) return false;
  const g = resolveGroup(input);
  if (g === "salon_beauty" || g === "bookings" || g === "fitness") return true;
  if (g === "automotive") return isAutoWorkshopType(input.industryType);
  return false;
}

/** Editor: Staff roster (stylists / trainers / mechanics). */
export function canShowStaffEditor(input: IndustryGateInput): boolean {
  const g = resolveGroup(input);
  if (g === "salon_beauty" || g === "bookings" || g === "fitness") return true;
  if (g === "automotive") return isAutoWorkshopType(input.industryType);
  return false;
}

/** Editor: Clinic license. */
export function canShowClinicEditor(input: IndustryGateInput): boolean {
  return isClinicLicenseGated(input.industryType, input.vertical);
}

/** RE Property-Bank editor + public listings. */
export function canShowPropertyBank(input: IndustryGateInput): boolean {
  return resolveGroup(input) === "real_estate";
}

/** Education courses + YouTube catalogue. */
export function canShowEducationCourses(input: IndustryGateInput): boolean {
  return resolveGroup(input) === "education";
}

/** Automotive vehicle inventory (dealers). */
export function canShowVehicleListings(input: IndustryGateInput): boolean {
  if (resolveGroup(input) !== "automotive") return false;
  // Default: show for dealers; workshops/parts can still hide via empty inventory
  return isAutoDealerType(input.industryType) || !input.industryType;
}

/** Automotive workshop book path. */
export function canShowAutoServiceBook(input: IndustryGateInput): boolean {
  return resolveGroup(input) === "automotive" && isAutoWorkshopType(input.industryType);
}

export function hasEntitlement(input: IndustryGateInput, sku: string): boolean {
  if (input.entitledSkus === undefined) {
    const def = getIndustryDef(resolveGroup(input));
    return def.flags.defaultModuleSkus.includes(sku);
  }
  return hasModuleSku(input.entitledSkus, sku);
}

/** Pay-then-book requires salon paid module (and Razorpay — checked separately). */
export function canUsePayThenBook(input: IndustryGateInput): boolean {
  if (resolveGroup(input) !== "salon_beauty") return false;
  return hasEntitlement(input, PAY_THEN_BOOK_SKU);
}

export const PRESENCE_BLOCKED_API_MESSAGE =
  "Commerce is not available for Presence profiles. Switch industry to sell or take bookings.";

export const CLINIC_GATE_MESSAGE =
  "Clinic license must be approved by ALINKS before public booking goes live.";

export const MODULE_BILLING_HINT = "Billing → Select modules";
