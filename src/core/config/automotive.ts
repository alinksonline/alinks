/**
 * Automotive type helpers — dealer vs workshop vs parts.
 */

export type AutoType =
  | "used_car_dealer"
  | "car_dealer_new"
  | "service_workshop"
  | "car_detailing"
  | "spare_parts_shop";

const DEALER_TYPES = new Set(["used_car_dealer", "car_dealer_new"]);
const WORKSHOP_TYPES = new Set(["service_workshop", "car_detailing"]);
const PARTS_TYPES = new Set(["spare_parts_shop"]);

export function isAutoDealerType(industryType?: string | null): boolean {
  return Boolean(industryType && DEALER_TYPES.has(industryType));
}

export function isAutoWorkshopType(industryType?: string | null): boolean {
  return Boolean(industryType && WORKSHOP_TYPES.has(industryType));
}

export function isAutoPartsType(industryType?: string | null): boolean {
  return Boolean(industryType && PARTS_TYPES.has(industryType));
}

/** Default module seeds differ by type. */
export function automotiveSeedProfile(industryType?: string | null): {
  vehicles: boolean;
  services: boolean;
  parts: boolean;
} {
  if (isAutoPartsType(industryType)) {
    return { vehicles: false, services: false, parts: true };
  }
  if (isAutoWorkshopType(industryType)) {
    return { vehicles: false, services: true, parts: false };
  }
  // dealers default
  return { vehicles: true, services: false, parts: false };
}
