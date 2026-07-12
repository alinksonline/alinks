import type { BlockType, PageBlock } from "@/core/types/page";

export type WidgetDef = {
  type: BlockType;
  label: string;
  hint: string;
  emoji: string;
};

/** Fixed set of mobile section widgets (curated — not Elementor). */
export const WIDGET_CATALOG: WidgetDef[] = [
  { type: "link", label: "Link button", hint: "One big tap target (Linktree-style)", emoji: "🔗" },
  { type: "whatsapp", label: "WhatsApp", hint: "Chat / order on WhatsApp", emoji: "💬" },
  { type: "text", label: "Text / story", hint: "Paragraph about your business", emoji: "📝" },
  { type: "features", label: "Highlights", hint: "Why customers choose you", emoji: "✨" },
  { type: "services", label: "Services list", hint: "Name, price, duration", emoji: "✂️" },
  { type: "cta", label: "Call to action", hint: "Book, order, or visit button", emoji: "👉" },
  { type: "hours", label: "Opening hours", hint: "Mon–Sun schedule", emoji: "🕐" },
  { type: "contact", label: "Contact", hint: "Phone, address, email", emoji: "📍" },
  { type: "gallery", label: "Photo gallery", hint: "Up to 6 image URLs", emoji: "📷" },
  { type: "legal", label: "Legal text", hint: "Terms or privacy copy", emoji: "📄" },
];

export function createBlock(type: BlockType): PageBlock {
  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const base = { id, type, visible: true as const };

  switch (type) {
    case "link":
      return {
        ...base,
        title: "Follow us",
        body: "",
        data: { href: "https://instagram.com", buttonLabel: "Open Instagram" },
      };
    case "whatsapp":
      return {
        ...base,
        title: "Chat on WhatsApp",
        body: "We reply fast during business hours.",
        // phone empty → public site uses Business profile WhatsApp
        data: { phone: "", message: "Hi! I found you on ALINKS." },
      };
    case "text":
      return { ...base, title: "Our story", body: "Tell customers who you are and what you do." };
    case "features":
      return { ...base, title: "Why choose us", body: "Quality · Trust · Local service" };
    case "services":
      return {
        ...base,
        title: "Services",
        body: "Popular offerings",
        data: {
          items: [
            { name: "Service one", price: "₹499", duration: "30 min" },
            { name: "Service two", price: "₹999", duration: "60 min" },
          ],
        },
      };
    case "cta":
      return {
        ...base,
        title: "Ready to book?",
        body: "Tap below to get started.",
        data: { href: "/contact", buttonLabel: "Contact us" },
      };
    case "hours":
      return {
        ...base,
        title: "Opening hours",
        body: "",
        data: {
          lines: ["Mon–Sat: 10:00 AM – 8:00 PM", "Sunday: Closed"],
        },
      };
    case "contact":
      return {
        ...base,
        title: "Visit or call",
        body: "We are happy to help.",
        // empty contact fields → public site uses Business profile
        data: { phone: "", address: "", email: "" },
      };
    case "gallery":
      return {
        ...base,
        title: "Gallery",
        body: "A peek at our work",
        data: {
          images: [
            {
              url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop",
              caption: "",
            },
          ],
        },
      };
    case "legal":
      return {
        ...base,
        title: "Terms & Privacy",
        body: "Describe your cancellation, refund, and privacy practices. You operate independently of Artix.",
      };
    default:
      return { ...base, title: "Section", body: "" };
  }
}

export function widgetLabel(type: BlockType): string {
  return WIDGET_CATALOG.find((w) => w.type === type)?.label ?? type;
}
