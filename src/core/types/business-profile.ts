/**
 * Business profile — single source of truth for identity & contact.
 * Stored on businesses.branding (jsonb) + businesses.name.
 * Socials are handles only (no full URLs).
 */
export type SocialHandles = {
  instagram: string;
  facebook: string;
  youtube: string;
  /** X / Twitter handle without @ */
  x: string;
};

export type BusinessProfile = {
  /** Display name (synced to businesses.name) */
  businessName: string;
  /** Public contact email for this business */
  email: string;
  /** Public phone (display / tel:) */
  phone: string;
  /** WhatsApp number (digits preferred, e.g. 9198…) */
  whatsapp: string;
  /** Optional address for contact/footer */
  address: string;
  logoUrl: string;
  faviconUrl: string;
  coverUrl: string;
  socials: SocialHandles;
};

export const EMPTY_SOCIALS: SocialHandles = {
  instagram: "",
  facebook: "",
  youtube: "",
  x: "",
};

export function defaultBusinessProfile(partial?: Partial<BusinessProfile> & { businessName?: string }): BusinessProfile {
  return {
    businessName: partial?.businessName ?? "",
    email: partial?.email ?? "",
    phone: partial?.phone ?? "",
    whatsapp: partial?.whatsapp ?? "",
    address: partial?.address ?? "",
    logoUrl: partial?.logoUrl ?? "",
    faviconUrl: partial?.faviconUrl ?? "",
    coverUrl: partial?.coverUrl ?? "",
    socials: {
      ...EMPTY_SOCIALS,
      ...(partial?.socials ?? {}),
    },
  };
}

/** Accepts legacy BrandingConfig-shaped JSON from DB. */
export function parseBusinessProfile(raw: unknown, fallbackName = ""): BusinessProfile {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const socialsRaw = (o.socials && typeof o.socials === "object" ? o.socials : {}) as Record<string, unknown>;
  return defaultBusinessProfile({
    businessName: String(o.businessName ?? fallbackName ?? ""),
    email: String(o.email ?? ""),
    phone: String(o.phone ?? ""),
    whatsapp: String(o.whatsapp ?? o.phone ?? ""),
    address: String(o.address ?? ""),
    logoUrl: String(o.logoUrl ?? ""),
    faviconUrl: String(o.faviconUrl ?? ""),
    coverUrl: String(o.coverUrl ?? ""),
    socials: {
      instagram: String(socialsRaw.instagram ?? ""),
      facebook: String(socialsRaw.facebook ?? ""),
      youtube: String(socialsRaw.youtube ?? ""),
      x: String(socialsRaw.x ?? socialsRaw.twitter ?? ""),
    },
  });
}
