import type { LayoutPresetId } from "./layout-preset";
import { DEFAULT_LAYOUT } from "./layout-preset";

export type HeroOverlay = "soft" | "medium" | "strong";
export type HeroCtaStyle = "solid" | "gradient" | "outline" | "ghost";

/** Visual options for the home hero (Styling tab). */
export type HeroStyle = {
  overlay?: HeroOverlay;
  /** When no cover image: use theme gradient */
  useThemeGradient?: boolean;
  ctaStyle?: HeroCtaStyle;
  ctaCorners?: "sharp" | "soft" | "round" | "pill";
};

export const DEFAULT_HERO_STYLE: Required<HeroStyle> = {
  overlay: "medium",
  useThemeGradient: true,
  ctaStyle: "solid",
  ctaCorners: "round",
};

export { DEFAULT_LAYOUT };
export type { LayoutPresetId };
