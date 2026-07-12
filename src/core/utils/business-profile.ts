import type { BusinessProfile, SocialHandles } from "@/core/types/business-profile";

/** Strip @ and URL junk — store handles only. */
export function normalizeSocialHandle(input: string): string {
  let h = input.trim();
  if (!h) return "";
  // If user pastes a URL or domain/path, take last path segment
  try {
    const looksLikeUrl =
      h.includes("://") ||
      h.startsWith("www.") ||
      /^(instagram|facebook|fb|youtube|youtu\.be|x|twitter)\.com\//i.test(h);
    if (looksLikeUrl) {
      const url = h.startsWith("http") ? new URL(h) : new URL(`https://${h}`);
      const parts = url.pathname.split("/").filter(Boolean);
      h = (parts[parts.length - 1] ?? "").replace(/^@/, "");
    }
  } catch {
    /* keep raw */
  }
  return h.replace(/^@+/, "").replace(/\/+$/, "").trim();
}

export function normalizePhoneDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function whatsappUrl(whatsappOrPhone: string, message?: string): string {
  const digits = normalizePhoneDigits(whatsappOrPhone);
  if (!digits) return "#";
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export function telUrl(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  return digits ? `tel:${digits}` : "#";
}

export function socialProfileUrl(
  network: keyof SocialHandles,
  handle: string,
): string | null {
  const h = normalizeSocialHandle(handle);
  if (!h) return null;
  switch (network) {
    case "instagram":
      return `https://instagram.com/${h}`;
    case "facebook":
      return `https://facebook.com/${h}`;
    case "youtube":
      return `https://youtube.com/@${h}`;
    case "x":
      return `https://x.com/${h}`;
    default:
      return null;
  }
}

export function listSocialLinks(profile: BusinessProfile): { network: keyof SocialHandles; label: string; href: string }[] {
  const labels: Record<keyof SocialHandles, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    x: "X",
  };
  const out: { network: keyof SocialHandles; label: string; href: string }[] = [];
  (Object.keys(labels) as (keyof SocialHandles)[]).forEach((network) => {
    const href = socialProfileUrl(network, profile.socials[network]);
    if (href) out.push({ network, label: labels[network], href });
  });
  return out;
}

export function normalizeProfileForSave(input: BusinessProfile): BusinessProfile {
  return {
    businessName: input.businessName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp.trim() || input.phone.trim(),
    address: input.address.trim(),
    logoUrl: input.logoUrl.trim(),
    faviconUrl: input.faviconUrl.trim(),
    coverUrl: input.coverUrl.trim(),
    socials: {
      instagram: normalizeSocialHandle(input.socials.instagram),
      facebook: normalizeSocialHandle(input.socials.facebook),
      youtube: normalizeSocialHandle(input.socials.youtube),
      x: normalizeSocialHandle(input.socials.x),
    },
  };
}
