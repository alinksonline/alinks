/** Link button visual controls (Linktree-style stack). */
export type LinkThickness = "thin" | "medium" | "thick";
export type LinkFill = "solid" | "gradient";
export type LinkCorners = "sharp" | "soft" | "round" | "pill";
export type LinkColorMode = "primary" | "accent" | "custom";
export type LinkBorderMode = "none" | "solid" | "gradient";
export type LinkIconKind = "none" | "icon" | "image";
export type LinkIconName =
  | "link"
  | "external"
  | "instagram"
  | "facebook"
  | "youtube"
  | "globe"
  | "phone"
  | "cart"
  | "star"
  | "arrow";

export type LinkButtonStyle = {
  thickness?: LinkThickness;
  fill?: LinkFill;
  colorMode?: LinkColorMode;
  customColor?: string;
  /** Second stop for fill gradient (optional; defaults to accent) */
  gradientTo?: string;
  corners?: LinkCorners;
  borderMode?: LinkBorderMode;
  borderWidth?: number;
  borderColorMode?: LinkColorMode;
  borderCustomColor?: string;
  borderGradientTo?: string;
  iconKind?: LinkIconKind;
  iconName?: LinkIconName;
  iconUrl?: string;
  iconSide?: "left" | "right";
};

export const DEFAULT_LINK_STYLE: Required<
  Pick<
    LinkButtonStyle,
    | "thickness"
    | "fill"
    | "colorMode"
    | "corners"
    | "borderMode"
    | "borderWidth"
    | "borderColorMode"
    | "iconKind"
    | "iconSide"
  >
> = {
  thickness: "medium",
  fill: "solid",
  colorMode: "primary",
  corners: "round",
  borderMode: "none",
  borderWidth: 1.5,
  borderColorMode: "primary",
  iconKind: "none",
  iconSide: "right",
};

export const LINK_ICON_OPTIONS: { id: LinkIconName; label: string }[] = [
  { id: "link", label: "Link" },
  { id: "external", label: "External" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "globe", label: "Web" },
  { id: "phone", label: "Phone" },
  { id: "cart", label: "Shop" },
  { id: "star", label: "Star" },
  { id: "arrow", label: "Arrow" },
];
