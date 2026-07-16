import { describe, expect, it } from "vitest";
import { resolveHeroPresentation } from "./hero-style";

describe("resolveHeroPresentation CTA contrast", () => {
  const hero = {
    title: "Test",
    tagline: "Tag",
    imageUrl: "https://example.com/x.jpg",
    ctaText: "Contact us",
    ctaLink: "/contact",
    style: { ctaStyle: "solid" as const },
  };

  it("solid CTA uses primary fill + light text on dark purple", () => {
    const p = resolveHeroPresentation(hero, "#4c1d95", "#7c3aed");
    expect(p.cta.background).toBe("#4c1d95");
    expect(p.cta.color).toBe("#ffffff");
  });

  it("solid CTA uses dark text on light primary", () => {
    const p = resolveHeroPresentation(hero, "#fef3c7", "#fbbf24");
    expect(p.cta.background).toBe("#fef3c7");
    expect(p.cta.color).toBe("#0f172a");
  });

  it("outline CTA uses white chrome on dark hero media", () => {
    const p = resolveHeroPresentation(
      { ...hero, style: { ctaStyle: "outline" } },
      "#4c1d95",
      "#7c3aed",
    );
    expect(p.cta.background).toBe("transparent");
    expect(p.cta.color).toBe("#ffffff");
  });

  it("title and tagline are white on hero", () => {
    const p = resolveHeroPresentation(hero, "#4c1d95", "#7c3aed");
    expect(p.title.color).toBe("#ffffff");
    expect(String(p.tagline.color)).toContain("255");
  });
});
