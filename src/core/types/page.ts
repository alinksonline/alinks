export interface PageHero {
  title: string;
  tagline: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
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
  businessName: string;
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
