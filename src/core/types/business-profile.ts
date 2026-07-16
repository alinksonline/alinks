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

/** When no dedicated OG image: which asset feeds WhatsApp / link previews. Default cover. */
export type OgFallbackPreference = "cover" | "favicon";

export type BusinessProfile = {
  /** Display name (synced to businesses.name) */
  businessName: string;
  /** Short line under the name (header / previews) */
  tagline: string;
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
  /** Dedicated Open Graph / share image (optional) */
  ogImageUrl: string;
  /**
   * When ogImageUrl is empty: use cover (default) or favicon for link previews.
   * Final chain: ogImageUrl → (cover|favicon by this flag) → the other → platform.
   */
  ogFallback: OgFallbackPreference;
  /**
   * When a logo is present, also show business name + tagline in the header.
   * Off = logo-only (logo may already include name/wordmark).
   */
  showTitleWithLogo: boolean;
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
    tagline: partial?.tagline ?? "",
    email: partial?.email ?? "",
    phone: partial?.phone ?? "",
    whatsapp: partial?.whatsapp ?? "",
    address: partial?.address ?? "",
    logoUrl: partial?.logoUrl ?? "",
    faviconUrl: partial?.faviconUrl ?? "",
    coverUrl: partial?.coverUrl ?? "",
    ogImageUrl: partial?.ogImageUrl ?? "",
    ogFallback: partial?.ogFallback === "favicon" ? "favicon" : "cover",
    showTitleWithLogo: partial?.showTitleWithLogo !== false,
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
    tagline: String(o.tagline ?? ""),
    email: String(o.email ?? ""),
    phone: String(o.phone ?? ""),
    whatsapp: String(o.whatsapp ?? o.phone ?? ""),
    address: String(o.address ?? ""),
    logoUrl: String(o.logoUrl ?? ""),
    faviconUrl: String(o.faviconUrl ?? ""),
    coverUrl: String(o.coverUrl ?? ""),
    ogImageUrl: String(o.ogImageUrl ?? ""),
    ogFallback: o.ogFallback === "favicon" ? "favicon" : "cover",
    showTitleWithLogo: o.showTitleWithLogo !== false && o.showTitleWithLogo !== "false",
    socials: {
      instagram: String(socialsRaw.instagram ?? ""),
      facebook: String(socialsRaw.facebook ?? ""),
      youtube: String(socialsRaw.youtube ?? ""),
      x: String(socialsRaw.x ?? socialsRaw.twitter ?? ""),
    },
  });
}

/**
 * Share-card image for OG/Twitter.
 * Priority: dedicated OG → preferred fallback (cover default) → other asset → null.
 */
export function resolveOgImageUrl(profile: BusinessProfile): string | null {
  if (profile.ogImageUrl.trim()) return profile.ogImageUrl.trim();
  const cover = profile.coverUrl.trim();
  const fav = profile.faviconUrl.trim();
  if (profile.ogFallback === "favicon") {
    return fav || cover || null;
  }
  return cover || fav || null;
}

/** Tab / PWA / “app icon” — favicon, else logo. */
export function resolveAppIconUrl(profile: BusinessProfile): string | null {
  return profile.faviconUrl.trim() || profile.logoUrl.trim() || null;
}
