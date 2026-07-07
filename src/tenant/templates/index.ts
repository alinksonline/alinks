import type { PageContent, SiteTemplateId, ThemeConfig } from "@/core/types/page";

const defaultTheme: ThemeConfig = {
  mode: "system",
  primaryColor: "#0f172a",
  accentColor: "#be185d",
  fontFamily: "Inter",
  borderRadius: "12px",
};

function hero(title: string, tagline: string): PageContent["hero"] {
  return {
    title,
    tagline,
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Contact us",
    ctaLink: "/contact",
  };
}

export const SITE_TEMPLATES: Record<
  SiteTemplateId,
  { label: string; theme: ThemeConfig; pages: Record<string, PageContent> }
> = {
  general: {
    label: "General business",
    theme: defaultTheme,
    pages: {
      home: {
        hero: hero("Welcome to your business", "We help customers every day with reliable service."),
        blocks: [{ id: "1", type: "features", title: "Why choose us", body: "Quality, trust, and local service." }],
      },
      about: {
        blocks: [{ id: "1", type: "text", title: "Our story", body: "Tell customers who you are and what you stand for." }],
      },
      services: {
        blocks: [{ id: "1", type: "services", title: "What we offer", body: "List your main services or products here." }],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Get in touch",
            body: "Phone, WhatsApp, and address — update in the editor.",
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Terms & Privacy",
            body: "Publish your terms and privacy policy. Operated independently — not Artix.",
          },
        ],
      },
    },
  },
  salon: {
    label: "Salon & beauty",
    theme: { ...defaultTheme, primaryColor: "#be185d", accentColor: "#f43f5e" },
    pages: {
      home: {
        hero: hero("Your salon name", "Book appointments and explore our packages."),
        blocks: [{ id: "1", type: "services", title: "Popular packages", body: "Haircut, facial, bridal packages." }],
      },
      about: {
        blocks: [{ id: "1", type: "text", title: "About our salon", body: "Experienced stylists and hygienic care." }],
      },
      services: {
        blocks: [{ id: "1", type: "services", title: "Services & packages", body: "Add prices and durations in Phase 2 booking." }],
      },
      contact: {
        blocks: [{ id: "1", type: "contact", title: "Visit or call", body: "Salon address and WhatsApp booking." }],
      },
      legal: {
        blocks: [{ id: "1", type: "legal", title: "Salon terms", body: "Cancellation policy and service disclaimers." }],
      },
    },
  },
  ecommerce: {
    label: "Shop / kirana",
    theme: { ...defaultTheme, primaryColor: "#059669", accentColor: "#10b981" },
    pages: {
      home: {
        hero: hero("Your shop", "Order on WhatsApp — fast local delivery."),
        blocks: [{ id: "1", type: "features", title: "Shop highlights", body: "Fresh stock, fair prices, WhatsApp orders." }],
      },
      about: {
        blocks: [{ id: "1", type: "text", title: "About our shop", body: "Family-run store serving the neighbourhood." }],
      },
      services: {
        blocks: [{ id: "1", type: "services", title: "Catalog", body: "Connect Google Sheets in dashboard to show products." }],
      },
      contact: {
        blocks: [{ id: "1", type: "contact", title: "Order & delivery", body: "WhatsApp number and delivery areas." }],
      },
      legal: {
        blocks: [{ id: "1", type: "legal", title: "Shop terms", body: "COD terms, returns, and privacy for customers." }],
      },
    },
  },
};