/**
 * Food industry type compatibility (Layer 1 + module gates).
 * HARD: cloud kitchen / cloud+catering NEVER get dine-in / table QR.
 */

export const FOOD_TYPES = [
  "restaurant",
  "cloud_kitchen",
  "catering_only",
  "cloud_catering",
] as const;

export type FoodTypeSlug = (typeof FOOD_TYPES)[number];

export type FoodTypeDef = {
  slug: FoodTypeSlug;
  label: string;
  description: string;
  /** Restaurant Dine-in module may be offered later. */
  dineInAllowed: boolean;
  /** Layer 1 menu display + WhatsApp (all food types). */
  menuDisplay: boolean;
  /** Public nav primary catalog label. */
  catalogLabel: "Menu" | "Packages";
};

export const FOOD_TYPE_DEFS: Record<FoodTypeSlug, FoodTypeDef> = {
  restaurant: {
    slug: "restaurant",
    label: "Restaurant",
    description: "Dining floor possible later. Menu + WhatsApp now.",
    dineInAllowed: true,
    menuDisplay: true,
    catalogLabel: "Menu",
  },
  cloud_kitchen: {
    slug: "cloud_kitchen",
    label: "Cloud kitchen",
    description: "Kitchen / online only. Never table QR or dine-in.",
    dineInAllowed: false,
    menuDisplay: true,
    catalogLabel: "Menu",
  },
  catering_only: {
    slug: "catering_only",
    label: "Catering only",
    description: "Event packages & enquiries. No table QR.",
    dineInAllowed: false,
    menuDisplay: true,
    catalogLabel: "Packages",
  },
  cloud_catering: {
    slug: "cloud_catering",
    label: "Cloud + catering",
    description: "Cloud kitchen with catering. Never dine-in.",
    dineInAllowed: false,
    menuDisplay: true,
    catalogLabel: "Menu",
  },
};

export function isFoodTypeSlug(slug: string): slug is FoodTypeSlug {
  return (FOOD_TYPES as readonly string[]).includes(slug);
}

export function resolveFoodType(industryType?: string | null, vertical?: string | null): FoodTypeSlug {
  if (industryType && isFoodTypeSlug(industryType)) return industryType;
  // Legacy single vertical
  if (vertical === "restaurant") return "restaurant";
  if (industryType === "catering") return "catering_only";
  return "restaurant";
}

export function isDineInAllowedForFoodType(typeSlug: string): boolean {
  if (!isFoodTypeSlug(typeSlug)) return false;
  return FOOD_TYPE_DEFS[typeSlug].dineInAllowed;
}

/** Modules that cloud* types must never enable. */
export const FOOD_FORBIDDEN_FOR_CLOUD = ["food.dine_in"] as const;

export function canEnableFoodModule(typeSlug: string, moduleSku: string): boolean {
  if (moduleSku === "food.dine_in") {
    return isDineInAllowedForFoodType(typeSlug);
  }
  if (moduleSku === "food.pickup" || moduleSku === "food.delivery") {
    // Rare for pure catering_only
    return typeSlug !== "catering_only";
  }
  return true;
}

export type FoodChannel = "pickup" | "delivery" | "dine_in" | "whatsapp";

export function channelAllowedForFoodType(
  typeSlug: string,
  channel: FoodChannel,
): boolean {
  if (channel === "whatsapp") return true;
  if (channel === "dine_in") return isDineInAllowedForFoodType(typeSlug);
  if (channel === "pickup" || channel === "delivery") {
    return typeSlug !== "catering_only";
  }
  return false;
}
