import type { Metadata } from "next";
import {
  parseBusinessProfile,
  resolveAppIconUrl,
  resolveOgImageUrl,
  type BusinessProfile,
} from "@/core/types/business-profile";
import { getEnv } from "@/core/config/env";

type TenantSeoInput = {
  handle: string;
  name: string;
  branding?: unknown;
  title?: string;
  description?: string;
  path?: string;
};

/**
 * Metadata for public mini-sites: title, icons (favicon≈app icon), OG image chain.
 * OG: dedicated → cover (default) or favicon by preference → other → none.
 */
export function buildTenantMetadata(input: TenantSeoInput): Metadata {
  const profile = parseBusinessProfile(input.branding, input.name);
  const displayName = profile.businessName || input.name;
  const title = input.title?.trim() || displayName;
  const description =
    input.description?.trim() ||
    profile.tagline?.trim() ||
    `${displayName} on ALINKS`;

  const env = getEnv();
  const base = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://alinks.online";
  const path = input.path ?? `/${input.handle}`;
  const pageUrl = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const og = resolveOgImageUrl(profile);
  const icon = resolveAppIconUrl(profile);

  const absolute = (url: string | null) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `${base}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const ogAbs = absolute(og);
  const iconAbs = absolute(icon);

  return {
    title,
    description,
    icons: iconAbs
      ? {
          icon: [{ url: iconAbs }],
          apple: [{ url: iconAbs }],
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      siteName: displayName,
      ...(ogAbs ? { images: [{ url: ogAbs }] } : {}),
    },
    twitter: {
      card: ogAbs ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogAbs ? { images: [ogAbs] } : {}),
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-title": displayName.slice(0, 12),
    },
  };
}

export function profileFromBranding(branding: unknown, name: string): BusinessProfile {
  return parseBusinessProfile(branding, name);
}
