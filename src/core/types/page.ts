import type { LinkButtonStyle } from "./link-button-style";
import type { SectionStyle } from "./section-style";
import type { HeroStyle } from "./hero-style";
import type { LayoutPresetId } from "./layout-preset";

export type { LinkButtonStyle } from "./link-button-style";
export type { SectionStyle } from "./section-style";
export type { HeroStyle } from "./hero-style";
export type { LayoutPresetId } from "./layout-preset";

export interface PageHero {
  title: string;
  tagline: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  /** Pulse · Orbit · Snap · Frame · Bloom */
  layout?: LayoutPresetId;
  /** Styling tab options */
  style?: HeroStyle;
}

/** Curated mobile section widgets (Linktree-style stack — not free layout). */
export type BlockType =
  | "text"
  | "features"
  | "services"
  | "contact"
  | "legal"
  | "whatsapp"
  | "hours"
  | "gallery"
  | "cta"
  | "link";

export type ServiceItem = {
  name: string;
  price?: string;
  duration?: string;
  description?: string;
};

export type GalleryImage = {
  url: string;
  caption?: string;
};

export type BlockData = {
  /** services */
  items?: ServiceItem[];
  /** whatsapp / contact phone */
  phone?: string;
  message?: string;
  email?: string;
  address?: string;
  /** hours — one line per day */
  lines?: string[];
  /** gallery */
  images?: GalleryImage[];
  /** cta / link */
  href?: string;
  buttonLabel?: string;
  imageUrl?: string;
  /** Link button visual style (thickness, fill, corners, border, icon) */
  linkStyle?: LinkButtonStyle;
  /** Card widgets: styling + layout (Highlights, Text, Services, …) */
  sectionStyle?: SectionStyle;
};

export interface PageBlock {
  id: string;
  type: BlockType;
  title: string;
  body: string;
  /** When false, hidden on public site but kept in editor */
  visible?: boolean;
  data?: BlockData;
}

export interface PageContent {
  hero?: PageHero;
  blocks: PageBlock[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
}

/** @deprecated Prefer BusinessProfile — kept for gradual migration */
export interface BrandingConfig {
  logoUrl: string;
  faviconUrl: string;
  coverUrl: string;
  /** Dedicated Open Graph / share image */
  ogImageUrl?: string;
  /** When OG empty: cover (default) or favicon */
  ogFallback?: "cover" | "favicon";
  businessName: string;
  tagline?: string;
  /** When logo set: also show name + tagline in header (default true) */
  showTitleWithLogo?: boolean;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    x?: string;
  };
}

export type { BusinessProfile, SocialHandles } from "./business-profile";

export type SiteTemplateId = "general" | "salon" | "ecommerce";
