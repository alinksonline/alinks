export interface PageHero {
  title: string;
  tagline: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

export interface PageBlock {
  id: string;
  type: "text" | "features" | "services" | "contact" | "legal";
  title: string;
  body: string;
  data?: Record<string, any>;
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

export interface BrandingConfig {
  logoUrl: string;
  faviconUrl: string;
  coverUrl: string;
  businessName: string;
}

export type SiteTemplateId = "general" | "salon" | "ecommerce";