/**
 * Industry registry (F0.1).
 * Industry only controls which modules are ALLOWED — not forced packs
 * (except compliance gates e.g. clinic).
 *
 * Frontend language: never “à la carte” — use “Select modules” / “Modules”.
 * Presence: “Creator Partner” / “Creator pricing” / “Influencer plan”.
 */

/** Top-level industry groups (product packs). */
export const INDUSTRY_GROUPS = [
  "presence",
  "salon_beauty",
  "food",
  "retail",
  "bookings",
  "real_estate",
  "education",
  "fitness",
  "automotive",
  "general",
  /** Parked / gated — not built as full packs yet */
  "pharmacy",
] as const;

export type IndustryGroup = (typeof INDUSTRY_GROUPS)[number];

/** Finance multi-brand insurance/loans — CALLED OFF; never appear as selectable. */
export const CALLED_OFF_INDUSTRIES = ["finance_insurance_loans"] as const;

export type IndustryFlags = {
  /** Industry is selectable in onboarding (when Superadmin has not disabled). */
  selectable: boolean;
  /** Commerce modules (store, cart, checkout, food order) may appear. */
  commerceModulesAllowed: boolean;
  /** Booking / appointments modules may appear. */
  bookingModulesAllowed: boolean;
  /** Any sales path on ALINKS (cart, pay-then-book, food order). */
  salesEnabled: boolean;
  /** Requires superadmin vertical gate (clinic / pharmacy). */
  licenseGate: boolean;
  /** Default website plan modules for this industry (granted on onboard). */
  defaultModuleSkus: readonly string[];
};

export type IndustryTypeDef = {
  slug: string;
  label: string;
  description: string;
  /** Creator Partner path (deep discounts ↔ promote ALINKS). */
  creatorPartnerEligible?: boolean;
  /** Prefer 1-page card layout. */
  cardMode?: boolean;
};

export type IndustryGroupDef = {
  group: IndustryGroup;
  label: string;
  shortLabel: string;
  description: string;
  flags: IndustryFlags;
  types: readonly IndustryTypeDef[];
  /** Legacy BusinessVertical values that map into this group. */
  legacyVerticals: readonly string[];
  /** Default template id for new sites. */
  defaultTemplateId:
    | "general"
    | "salon"
    | "ecommerce"
    | "presence"
    | "food"
    | "bookings"
    | "real_estate"
    | "education"
    | "fitness"
    | "automotive";
  /** Onboarding sort order (lower first). */
  sortOrder: number;
};

const PRESENCE_CORE_SKUS = [
  "pr.presence_core",
  "pr.link_stack",
  "pr.gallery",
  "pr.contact",
  "pr.share_kit",
] as const;

export const INDUSTRY_REGISTRY: Record<IndustryGroup, IndustryGroupDef> = {
  presence: {
    group: "presence",
    label: "Presence / Profile",
    shortLabel: "Presence",
    description: "Online presence only — link hub, gallery, collab. No selling on ALINKS.",
    flags: {
      selectable: true,
      commerceModulesAllowed: false,
      bookingModulesAllowed: false,
      salesEnabled: false,
      licenseGate: false,
      defaultModuleSkus: PRESENCE_CORE_SKUS,
    },
    types: [
      {
        slug: "influencer_creator",
        label: "Influencer / creator",
        description: "Your professional link hub — collabs & media kit, no shop required.",
        creatorPartnerEligible: true,
      },
      {
        slug: "personal_brand",
        label: "Personal brand / portfolio",
        description: "Portfolio site with optional media kit.",
      },
      {
        slug: "business_profile_only",
        label: "Business profile only",
        description: "Brochure site — call, WhatsApp, and about. No shop.",
      },
      {
        slug: "community_presence",
        label: "Community / NGO / club",
        description: "About + contact for communities and clubs.",
      },
      {
        slug: "professional_card",
        label: "Digital visiting card",
        description: "One-page card mode — bio, links, contact.",
        cardMode: true,
      },
    ],
    legacyVerticals: ["presence"],
    defaultTemplateId: "presence",
    sortOrder: 1,
  },
  salon_beauty: {
    group: "salon_beauty",
    label: "Salon & beauty",
    shortLabel: "Salon",
    description: "Packages, staff, free booking.",
    flags: {
      selectable: true,
      commerceModulesAllowed: true,
      bookingModulesAllowed: true,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: ["book.appointments_core", "sb.packages", "sb.staff_roster"],
    },
    types: [
      { slug: "salon", label: "Salon", description: "Hair, nails, grooming." },
      { slug: "beauty_spa", label: "Beauty / spa", description: "Beauty and spa services." },
    ],
    legacyVerticals: ["salon", "beauty"],
    defaultTemplateId: "salon",
    sortOrder: 2,
  },
  food: {
    group: "food",
    label: "Food",
    shortLabel: "Food",
    description: "Restaurant, cloud kitchen, catering — menu + WhatsApp first.",
    flags: {
      selectable: true,
      commerceModulesAllowed: true,
      bookingModulesAllowed: false,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: ["food.menu_display"],
    },
    types: [
      {
        slug: "restaurant",
        label: "Restaurant",
        description: "Menu + WhatsApp now. Dine-in module later if you want tables.",
      },
      {
        slug: "cloud_kitchen",
        label: "Cloud kitchen",
        description: "Kitchen / online only — never table QR or dine-in.",
      },
      {
        slug: "catering_only",
        label: "Catering only",
        description: "Event packages & enquiries. No table QR.",
      },
      {
        slug: "cloud_catering",
        label: "Cloud + catering",
        description: "Cloud kitchen with catering. Never dine-in.",
      },
    ],
    legacyVerticals: ["restaurant"],
    defaultTemplateId: "food",
    sortOrder: 3,
  },
  retail: {
    group: "retail",
    label: "Retail / shop",
    shortLabel: "Retail",
    description: "Product storefront + WhatsApp/COD. No multi-outlet POS.",
    flags: {
      selectable: true,
      commerceModulesAllowed: true,
      bookingModulesAllowed: false,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: ["retail.storefront"],
    },
    types: [
      {
        slug: "kirana",
        label: "Kirana / grocery",
        description: "Neighbourhood shop — open product categories.",
      },
      {
        slug: "ecommerce",
        label: "Online shop",
        description: "Product catalog + WhatsApp or cart checkout.",
      },
      {
        slug: "multi_brand",
        label: "Multi-brand store",
        description: "Optional brand tags on products (one seller).",
      },
      {
        slug: "retail_shop",
        label: "General retail shop",
        description: "Sell any legal category — kitchen, fashion, electronics…",
      },
    ],
    legacyVerticals: ["kirana", "grocery", "ecommerce"],
    defaultTemplateId: "ecommerce",
    sortOrder: 4,
  },
  bookings: {
    group: "bookings",
    label: "Bookings & consults",
    shortLabel: "Bookings",
    description: "Clinic, consults, lawyers, venues — one slots engine.",
    flags: {
      selectable: true,
      commerceModulesAllowed: false,
      bookingModulesAllowed: true,
      salesEnabled: true,
      /** Group may include clinic; per-type gate is enforced in publish/book. */
      licenseGate: true,
      defaultModuleSkus: ["book.appointments_core"],
    },
    types: [
      {
        slug: "clinic",
        label: "Clinic / healthcare",
        description: "Doctor slots — NMC license + superadmin approval before go-live.",
      },
      {
        slug: "professional_consult",
        label: "Professional consult",
        description: "Coaches, advisors, general consults — free book OK.",
      },
      {
        slug: "legal_lawyers",
        label: "Lawyers / legal",
        description: "Consultation booking only — not full case CMS.",
      },
      {
        slug: "venue_banquet",
        label: "Venue / banquet hall",
        description: "Hall / lawn packages by date — not restaurant table QR.",
      },
    ],
    legacyVerticals: ["clinic"],
    defaultTemplateId: "bookings",
    sortOrder: 5,
  },
  real_estate: {
    group: "real_estate",
    label: "Real estate",
    shortLabel: "Real estate",
    description: "Property-Bank listings + leads. No title checkout / escrow.",
    flags: {
      selectable: true,
      commerceModulesAllowed: false,
      bookingModulesAllowed: true,
      salesEnabled: false,
      licenseGate: false,
      defaultModuleSkus: ["re.property_bank"],
    },
    types: [
      { slug: "agent", label: "Agent / broker", description: "Listings + lead capture." },
      { slug: "builder", label: "Builder / project", description: "Project showcase + leads." },
    ],
    legacyVerticals: [],
    defaultTemplateId: "real_estate",
    sortOrder: 6,
  },
  education: {
    group: "education",
    label: "Education",
    shortLabel: "Education",
    description: "Courses, enquiry, YouTube-only video. Open subjects/skills.",
    flags: {
      selectable: true,
      commerceModulesAllowed: false,
      bookingModulesAllowed: true,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: ["edu.courses", "edu.enquiry", "edu.media_youtube"],
    },
    types: [
      {
        slug: "tuition",
        label: "Tuition / coaching",
        description: "Batch classes, demo, free enquiry.",
      },
      {
        slug: "school_college",
        label: "School / college",
        description: "Admissions marketing + campus enquiry (not full ERP).",
      },
      {
        slug: "skill_class",
        label: "Skill / music / arts",
        description: "Any skill — open catalogue, not music-only.",
      },
      {
        slug: "independent_teacher",
        label: "Independent teacher",
        description: "Side-income tutor with own mini-site.",
      },
    ],
    legacyVerticals: [],
    defaultTemplateId: "education",
    sortOrder: 7,
  },
  fitness: {
    group: "fitness",
    label: "Fitness",
    shortLabel: "Fitness",
    description: "Gym, yoga, PT — memberships, classes, free trial book.",
    flags: {
      selectable: true,
      commerceModulesAllowed: false,
      bookingModulesAllowed: true,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: ["fit.memberships", "fit.classes", "fit.trial_booking", "book.appointments_core"],
    },
    types: [
      { slug: "gym", label: "Gym", description: "Memberships + group classes + trial." },
      { slug: "fitness_studio", label: "Fitness studio", description: "Boutique classes and packs." },
      { slug: "yoga_studio", label: "Yoga studio", description: "Yoga / wellness classes." },
      { slug: "personal_trainer", label: "Personal trainer", description: "PT packs and free consult." },
      { slug: "martial_arts", label: "Martial arts", description: "Academy classes and trials." },
    ],
    legacyVerticals: [],
    defaultTemplateId: "fitness",
    sortOrder: 8,
  },
  automotive: {
    group: "automotive",
    label: "Automotive",
    shortLabel: "Auto",
    description: "Dealers, workshop, parts — enquiry + service book, no car checkout.",
    flags: {
      selectable: true,
      commerceModulesAllowed: true,
      bookingModulesAllowed: true,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: ["auto.vehicle_listings", "auto.leads", "book.appointments_core"],
    },
    types: [
      {
        slug: "used_car_dealer",
        label: "Used car dealer",
        description: "Vehicle showcase + enquiry (no online title sale).",
      },
      {
        slug: "car_dealer_new",
        label: "New car dealer",
        description: "Showroom listings + test-drive / buy interest leads.",
      },
      {
        slug: "service_workshop",
        label: "Service workshop",
        description: "Service packages + free slot booking.",
      },
      {
        slug: "car_detailing",
        label: "Car detailing",
        description: "Detailing packages + book slots.",
      },
      {
        slug: "spare_parts_shop",
        label: "Spare parts shop",
        description: "Parts catalogue (retail path) + enquiry.",
      },
    ],
    legacyVerticals: [],
    defaultTemplateId: "automotive",
    sortOrder: 9,
  },
  general: {
    group: "general",
    label: "General business",
    shortLabel: "General",
    description: "General mini-site. Prefer Presence if you only need a profile.",
    flags: {
      selectable: true,
      commerceModulesAllowed: true,
      bookingModulesAllowed: false,
      salesEnabled: true,
      licenseGate: false,
      defaultModuleSkus: [],
    },
    types: [{ slug: "general", label: "General", description: "Flexible starter site." }],
    legacyVerticals: ["general"],
    defaultTemplateId: "general",
    sortOrder: 10,
  },
  pharmacy: {
    group: "pharmacy",
    label: "Pharmacy",
    shortLabel: "Pharmacy",
    description: "OTC path only — gated. Phase 2 thin.",
    flags: {
      selectable: true,
      commerceModulesAllowed: true,
      bookingModulesAllowed: false,
      salesEnabled: true,
      licenseGate: true,
      defaultModuleSkus: [],
    },
    types: [{ slug: "pharmacy_otc", label: "Pharmacy (OTC)", description: "Superadmin OTC approval required." }],
    legacyVerticals: ["pharmacy"],
    defaultTemplateId: "general",
    sortOrder: 30,
  },
};

/** Vertical string stored on businesses.vertical (legacy + presence). */
export const LEGACY_VERTICALS = [
  "salon",
  "beauty",
  "kirana",
  "grocery",
  "ecommerce",
  "restaurant",
  "clinic",
  "pharmacy",
  "general",
  "presence",
] as const;

export type LegacyVertical = (typeof LEGACY_VERTICALS)[number];

const VERTICAL_TO_GROUP: Record<string, IndustryGroup> = {
  presence: "presence",
  salon: "salon_beauty",
  beauty: "salon_beauty",
  kirana: "retail",
  grocery: "retail",
  ecommerce: "retail",
  restaurant: "food",
  clinic: "bookings",
  pharmacy: "pharmacy",
  general: "general",
};

const TYPE_TO_VERTICAL: Record<string, LegacyVertical> = {
  influencer_creator: "presence",
  personal_brand: "presence",
  business_profile_only: "presence",
  community_presence: "presence",
  professional_card: "presence",
  salon: "salon",
  beauty_spa: "beauty",
  restaurant: "restaurant",
  cloud_kitchen: "restaurant",
  catering_only: "restaurant",
  cloud_catering: "restaurant",
  catering: "restaurant",
  kirana: "kirana",
  ecommerce: "ecommerce",
  multi_brand: "ecommerce",
  retail_shop: "ecommerce",
  clinic: "clinic",
  professional_consult: "general",
  legal_lawyers: "general",
  venue_banquet: "general",
  pharmacy_otc: "pharmacy",
  agent: "general",
  builder: "general",
  tuition: "general",
  school_college: "general",
  skill_class: "general",
  independent_teacher: "general",
  gym: "general",
  fitness_studio: "general",
  yoga_studio: "general",
  personal_trainer: "general",
  martial_arts: "general",
  used_car_dealer: "general",
  car_dealer_new: "general",
  service_workshop: "general",
  car_detailing: "general",
  spare_parts_shop: "ecommerce",
  general: "general",
};

/** Clinic healthcare requires license approval before publish / public book. */
export function isClinicLicenseGated(industryType?: string | null, vertical?: string | null): boolean {
  if (vertical === "clinic") return true;
  return industryType === "clinic" || industryType === "clinic_healthcare";
}

export function resolveIndustryGroup(verticalOrGroup: string): IndustryGroup {
  if ((INDUSTRY_GROUPS as readonly string[]).includes(verticalOrGroup)) {
    return verticalOrGroup as IndustryGroup;
  }
  return VERTICAL_TO_GROUP[verticalOrGroup] ?? "general";
}

export function getIndustryDef(group: IndustryGroup | string): IndustryGroupDef {
  const g = resolveIndustryGroup(group);
  return INDUSTRY_REGISTRY[g];
}

export function isSalesEnabledForIndustry(verticalOrGroup: string): boolean {
  return getIndustryDef(verticalOrGroup).flags.salesEnabled;
}

export function isCommerceAllowedForIndustry(verticalOrGroup: string): boolean {
  return getIndustryDef(verticalOrGroup).flags.commerceModulesAllowed;
}

export function isBookingAllowedForIndustry(verticalOrGroup: string): boolean {
  return getIndustryDef(verticalOrGroup).flags.bookingModulesAllowed;
}

export function isPresenceIndustry(verticalOrGroup: string): boolean {
  return resolveIndustryGroup(verticalOrGroup) === "presence";
}

/** Map industry group + type → legacy vertical column (compat). */
export function industryToLegacyVertical(group: IndustryGroup | string, typeSlug?: string): LegacyVertical {
  if (typeSlug && TYPE_TO_VERTICAL[typeSlug]) return TYPE_TO_VERTICAL[typeSlug];
  const def = getIndustryDef(group);
  const first = def.legacyVerticals[0];
  if (first && (LEGACY_VERTICALS as readonly string[]).includes(first)) {
    return first as LegacyVertical;
  }
  if (def.group === "presence") return "presence";
  return "general";
}

/** Default industry type when only vertical is known. */
export function defaultIndustryType(verticalOrGroup: string): string {
  const def = getIndustryDef(verticalOrGroup);
  const match = def.types.find((t) => t.slug === verticalOrGroup);
  if (match) return match.slug;
  if (verticalOrGroup === "beauty") return "beauty_spa";
  if (verticalOrGroup === "grocery" || verticalOrGroup === "kirana") return "kirana";
  if (verticalOrGroup === "pharmacy") return "pharmacy_otc";
  return def.types[0]?.slug ?? "general";
}

export function selectableIndustries(): IndustryGroupDef[] {
  return INDUSTRY_GROUPS.map((g) => INDUSTRY_REGISTRY[g])
    .filter((d) => d.flags.selectable)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isCreatorPartnerEligible(group: string, typeSlug: string): boolean {
  if (resolveIndustryGroup(group) !== "presence") return false;
  const t = INDUSTRY_REGISTRY.presence.types.find((x) => x.slug === typeSlug);
  return Boolean(t?.creatorPartnerEligible);
}

/** Creator Partner discount ladder (list % off website plan). Superadmin may tighten. */
export const CREATOR_PARTNER_TIERS = {
  A: {
    code: "A" as const,
    label: "Creator",
    discountPctMonthly: 35,
    discountPctYearly: 40,
    summary: "Keep an ALINKS link on your hub · light monthly mention",
  },
  B: {
    code: "B" as const,
    label: "Creator Launch",
    discountPctMonthly: 60,
    discountPctYearly: 60,
    summary: "Launch deal — hub link + launch post pack + quarterly light",
  },
  C: {
    code: "C" as const,
    label: "Creator Pro Partner",
    discountPctMonthly: 50,
    discountPctYearly: 55,
    summary: "Deep discount + pin ALINKS partner link",
  },
  D: {
    code: "D" as const,
    label: "Creator micro / free window",
    discountPctMonthly: 100,
    discountPctYearly: 70,
    summary: "Short free or near-free Starter window for micro creators",
  },
} as const;

export type CreatorPartnerTierCode = keyof typeof CREATOR_PARTNER_TIERS;
