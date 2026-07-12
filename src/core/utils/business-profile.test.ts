import { describe, expect, it } from "vitest";
import {
  listSocialLinks,
  normalizeSocialHandle,
  socialProfileUrl,
  whatsappUrl,
} from "./business-profile";
import { defaultBusinessProfile } from "@/core/types/business-profile";

describe("business profile helpers", () => {
  it("normalizes social handles from raw or URL", () => {
    expect(normalizeSocialHandle("@priya_salon")).toBe("priya_salon");
    expect(normalizeSocialHandle("https://instagram.com/priya_salon")).toBe("priya_salon");
    expect(normalizeSocialHandle("instagram.com/priya_salon/")).toBe("priya_salon");
  });

  it("builds social and whatsapp urls", () => {
    expect(socialProfileUrl("instagram", "priya")).toBe("https://instagram.com/priya");
    expect(whatsappUrl("919876543210")).toBe("https://wa.me/919876543210");
  });

  it("lists only filled socials", () => {
    const p = defaultBusinessProfile({
      businessName: "Test",
      socials: { instagram: "a", facebook: "", youtube: "", x: "b" },
    });
    const links = listSocialLinks(p);
    expect(links.map((l) => l.network)).toEqual(["instagram", "x"]);
  });
});
