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
        blocks: [
          { id: "1", type: "features", title: "Why choose us", body: "Quality · Trust · Local service", visible: true },
          {
            id: "2",
            type: "whatsapp",
            title: "Chat on WhatsApp",
            body: "Fast replies during business hours",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi! I found you on ALINKS." },
          },
          {
            id: "3",
            type: "link",
            title: "Our services",
            body: "",
            visible: true,
            data: { href: "/services", buttonLabel: "View services" },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Our story",
            body: "Tell customers who you are and what you stand for.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "What we offer",
            body: "Popular choices",
            visible: true,
            data: {
              items: [
                { name: "Service one", price: "₹499", duration: "30 min" },
                { name: "Service two", price: "₹999", duration: "60 min" },
              ],
            },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Get in touch",
            body: "We are nearby and happy to help.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Your area, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Opening hours",
            body: "",
            visible: true,
            data: { lines: ["Mon–Sat: 10:00 AM – 8:00 PM", "Sunday: Closed"] },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp us",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi!" },
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
            visible: true,
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
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Popular packages",
            body: "Tap to book on WhatsApp",
            visible: true,
            data: {
              items: [
                { name: "Haircut & styling", price: "₹599", duration: "45 min" },
                { name: "Facial glow", price: "₹799", duration: "60 min" },
              ],
            },
          },
          {
            id: "2",
            type: "cta",
            title: "Book a slot",
            body: "Pay-then-book packages available",
            visible: true,
            data: { href: "/book", buttonLabel: "Book now" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "WhatsApp salon",
            body: "",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi, I want to book a salon service." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About our salon",
            body: "Experienced stylists and hygienic care.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "services",
            title: "Services & packages",
            body: "Add more in the editor",
            visible: true,
            data: {
              items: [
                { name: "Haircut", price: "₹399", duration: "30 min" },
                { name: "Bridal package", price: "₹9999", duration: "4 hr" },
              ],
            },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Visit or call",
            body: "Walk-ins welcome when slots are free.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Salon street, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Hours",
            body: "",
            visible: true,
            data: { lines: ["Tue–Sun: 10:00 AM – 8:00 PM", "Monday: Closed"] },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Salon terms",
            body: "Cancellation policy and service disclaimers.",
            visible: true,
          },
        ],
      },
    },
  },
  ecommerce: {
    label: "Shop / kirana",
    theme: { ...defaultTheme, primaryColor: "#059669", accentColor: "#10b981" },
    pages: {
      home: {
        hero: hero("Your shop", "Order on WhatsApp — fast local delivery."),
        blocks: [
          {
            id: "1",
            type: "features",
            title: "Shop highlights",
            body: "Fresh stock · Fair prices · WhatsApp orders",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Browse store",
            body: "",
            visible: true,
            data: { href: "/store", buttonLabel: "Open store" },
          },
          {
            id: "3",
            type: "whatsapp",
            title: "Order on WhatsApp",
            body: "Send your list — we confirm stock",
            visible: true,
            data: { phone: "91XXXXXXXXXX", message: "Hi, I want to order from your shop." },
          },
        ],
      },
      about: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "About our shop",
            body: "Family-run store serving the neighbourhood.",
            visible: true,
          },
        ],
      },
      services: {
        blocks: [
          {
            id: "1",
            type: "text",
            title: "Catalog",
            body: "Connect Google Sheets in dashboard to sync products. Use Store page for the full list.",
            visible: true,
          },
          {
            id: "2",
            type: "link",
            title: "Full store",
            body: "",
            visible: true,
            data: { href: "/store", buttonLabel: "Shop now" },
          },
        ],
      },
      contact: {
        blocks: [
          {
            id: "1",
            type: "contact",
            title: "Order & delivery",
            body: "Delivery areas and timings below.",
            visible: true,
            data: { phone: "91XXXXXXXXXX", address: "Shop area, City" },
          },
          {
            id: "2",
            type: "hours",
            title: "Shop hours",
            body: "",
            visible: true,
            data: { lines: ["Daily: 8:00 AM – 9:00 PM"] },
          },
        ],
      },
      legal: {
        blocks: [
          {
            id: "1",
            type: "legal",
            title: "Shop terms",
            body: "COD terms, returns, and privacy for customers.",
            visible: true,
          },
        ],
      },
    },
  },
};