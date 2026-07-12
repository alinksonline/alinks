import type { BusinessProfile } from "@/core/types/business-profile";
import type { PageBlock } from "@/core/types/page";

/** Placeholder numbers from templates are not real contact data. */
export function isPlaceholderContact(value?: string): boolean {
  if (!value?.trim()) return true;
  const v = value.trim();
  if (/x{3,}/i.test(v)) return true;
  if (/^91X+/i.test(v)) return true;
  if (v === "91XXXXXXXXXX") return true;
  return false;
}

/**
 * Merge page widgets with business profile (Step 2).
 * Profile fills empty/placeholder phone, WhatsApp, email, address.
 * Explicit non-placeholder widget values still win (rare overrides).
 */
export function resolveBlockWithProfile(block: PageBlock, profile: BusinessProfile | null | undefined): PageBlock {
  if (!profile) return block;
  const data = { ...(block.data ?? {}) };

  if (block.type === "whatsapp") {
    const phone = !isPlaceholderContact(data.phone)
      ? data.phone
      : profile.whatsapp || profile.phone || "";
    return {
      ...block,
      data: {
        ...data,
        phone,
        message:
          data.message?.trim() ||
          `Hi! I found ${profile.businessName || "your business"} on ALINKS.`,
      },
    };
  }

  if (block.type === "contact") {
    return {
      ...block,
      data: {
        ...data,
        phone: !isPlaceholderContact(data.phone) ? data.phone : profile.phone || "",
        email: data.email?.trim() ? data.email : profile.email || "",
        address: data.address?.trim() ? data.address : profile.address || "",
      },
    };
  }

  return block;
}

/** Ensure contact page always has profile-driven contact + WhatsApp sections when missing. */
export function ensureContactPageBlocks(
  blocks: PageBlock[],
  profile: BusinessProfile,
): PageBlock[] {
  const list = [...blocks];
  const hasContact = list.some((b) => b.type === "contact" && b.visible !== false);
  const hasWa = list.some((b) => b.type === "whatsapp" && b.visible !== false);

  if (!hasContact) {
    list.unshift({
      id: "profile-contact",
      type: "contact",
      title: "Get in touch",
      body: "Reach us using the details below.",
      visible: true,
      data: {
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
      },
    });
  }

  if (!hasWa && (profile.whatsapp || profile.phone)) {
    list.push({
      id: "profile-whatsapp",
      type: "whatsapp",
      title: "Chat on WhatsApp",
      body: "We usually reply during business hours.",
      visible: true,
      data: {
        phone: profile.whatsapp || profile.phone,
        message: `Hi! I found ${profile.businessName || "you"} on ALINKS.`,
      },
    });
  }

  return list;
}
