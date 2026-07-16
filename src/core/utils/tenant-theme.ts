import type { CSSProperties } from "react";
import type { ThemeConfig } from "@/core/types/page";

export const DEFAULT_TENANT_THEME: ThemeConfig = {
  mode: "light",
  primaryColor: "#0f172a",
  accentColor: "#7c3aed",
  fontFamily: "Inter",
  borderRadius: "12px",
};

/** Curated fonts we actually load (Google Fonts) on public mini-sites. */
export const TENANT_FONT_OPTIONS = [
  { id: "Inter", label: "Inter", google: "Inter:wght@400;500;600;700" },
  { id: "Poppins", label: "Poppins", google: "Poppins:wght@400;500;600;700" },
  { id: "DM Sans", label: "DM Sans", google: "DM+Sans:wght@400;500;600;700" },
  { id: "Nunito", label: "Nunito", google: "Nunito:wght@400;600;700" },
  { id: "Playfair", label: "Playfair", google: "Playfair+Display:wght@400;600;700" },
  { id: "Space Grotesk", label: "Space Grotesk", google: "Space+Grotesk:wght@400;500;600;700" },
  { id: "system", label: "System", google: null },
  { id: "Serif", label: "Serif", google: null },
  { id: "Mono", label: "Mono", google: "JetBrains+Mono:wght@400;500;600" },
] as const;

export type TenantFontId = (typeof TENANT_FONT_OPTIONS)[number]["id"];

export const FONT_STACKS: Record<string, string> = {
  Inter: '"Inter", system-ui, sans-serif',
  Poppins: '"Poppins", system-ui, sans-serif',
  "DM Sans": '"DM Sans", system-ui, sans-serif',
  Nunito: '"Nunito", system-ui, sans-serif',
  Playfair: '"Playfair Display", Georgia, serif',
  "Space Grotesk": '"Space Grotesk", system-ui, sans-serif',
  system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  Serif: 'Georgia, "Times New Roman", serif',
  Mono: '"JetBrains Mono", ui-monospace, monospace',
  // Legacy theme values → nearest stack
  Rounded: '"Nunito", system-ui, sans-serif',
};

/** Map legacy font ids from older theme saves. */
export function normalizeFontId(raw: string): string {
  if (raw === "Rounded") return "Nunito";
  if (FONT_STACKS[raw]) return raw;
  return "Inter";
}

export function fontStackFor(fontFamily: string): string {
  const id = normalizeFontId(fontFamily);
  return FONT_STACKS[id] ?? FONT_STACKS.Inter;
}

export function googleFontsHref(fontFamily: string): string | null {
  const id = normalizeFontId(fontFamily);
  const opt = TENANT_FONT_OPTIONS.find((f) => f.id === id);
  if (!opt?.google) return null;
  return `https://fonts.googleapis.com/css2?family=${opt.google}&display=swap`;
}

/** One stylesheet with every curated Google face (for live theme picker). */
export function allTenantGoogleFontsHref(): string {
  const families = TENANT_FONT_OPTIONS.map((f) => f.google).filter(Boolean) as string[];
  // css2 API: family=Inter:wght@…&family=Poppins:…
  const q = families.map((f) => `family=${encodeURIComponent(f).replace(/%3A/g, ":").replace(/%40/g, "@")}`).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/** Parse stored theme JSON into a complete ThemeConfig. */
export function parseThemeConfig(raw: unknown, fallbackPrimary?: string): ThemeConfig {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const mode = o.mode === "dark" || o.mode === "system" || o.mode === "light" ? o.mode : "light";
  const fontRaw = typeof o.fontFamily === "string" && o.fontFamily ? o.fontFamily : DEFAULT_TENANT_THEME.fontFamily;
  return {
    mode,
    primaryColor:
      typeof o.primaryColor === "string" && o.primaryColor
        ? o.primaryColor
        : fallbackPrimary || DEFAULT_TENANT_THEME.primaryColor,
    accentColor:
      typeof o.accentColor === "string" && o.accentColor ? o.accentColor : DEFAULT_TENANT_THEME.accentColor,
    fontFamily: normalizeFontId(fontRaw),
    borderRadius:
      typeof o.borderRadius === "string" && o.borderRadius ? o.borderRadius : DEFAULT_TENANT_THEME.borderRadius,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Relative luminance for WCAG-ish contrast picks. */
function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastOn(hex: string): "#ffffff" | "#0f172a" {
  return luminance(hex) > 0.45 ? "#0f172a" : "#ffffff";
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix hex toward another color (t = 0 keeps a, t = 1 becomes b). */
export function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return a;
  const k = Math.max(0, Math.min(1, t));
  return rgbToHex(A.r + (B.r - A.r) * k, A.g + (B.g - A.g) * k, A.b + (B.b - A.b) * k);
}

/**
 * Primary as text/icon on a light or dark page surface.
 * Dark brand purples on dark UI become unreadable — lighten them for links/active labels.
 */
export function primaryTextOnSurface(primary: string, surface: "light" | "dark"): string {
  const L = luminance(primary);
  if (surface === "dark") {
    if (L < 0.5) return mixHex(primary, "#ffffff", 0.42 + (0.5 - L) * 0.55);
    return primary;
  }
  if (L > 0.62) return mixHex(primary, "#0f172a", 0.4);
  return primary;
}

/** Soft fill that stays visible on dark surfaces (hex8 alpha is unreliable in older WebViews). */
function primarySoftToken(primary: string, surface: "light" | "dark"): string {
  const rgb = hexToRgb(primary);
  if (!rgb) return surface === "dark" ? "rgba(167,139,250,0.22)" : "rgba(91,33,182,0.12)";
  const a = surface === "dark" ? 0.28 : 0.12;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

export type ResolvedTenantTheme = {
  theme: ThemeConfig;
  /** Inline style for the themed shell root */
  style: CSSProperties;
  primary: string;
  accent: string;
  onPrimary: string;
  radius: string;
  googleFontsHref: string | null;
};

/**
 * Full theme token set as CSS custom properties for `.tenant-theme`.
 * Light/dark surfaces flip with data-mode; primary fill stays brand, text tokens stay readable.
 */
export function resolveTenantTheme(raw: unknown, fallbackPrimary?: string): ResolvedTenantTheme {
  const theme = parseThemeConfig(raw, fallbackPrimary);
  const primary = theme.primaryColor;
  const accent = theme.accentColor;
  const onPrimary = contrastOn(primary);
  const radius = theme.borderRadius || "12px";
  const fontId = normalizeFontId(theme.fontFamily);
  const font = FONT_STACKS[fontId] ?? FONT_STACKS.Inter;

  // Surface palettes — dark muted bumped for secondary copy/footer contrast
  const light = {
    bg: "#f7f6f9",
    surface: "#ffffff",
    ink: "#0f172a",
    muted: "#57534e",
    border: "rgba(15, 23, 42, 0.12)",
    soft: "rgba(15, 23, 42, 0.05)",
  };
  const dark = {
    bg: "#0c0a12",
    surface: "#1a1628",
    ink: "#f4f2fa",
    muted: "#c4bfd6",
    border: "rgba(244, 242, 250, 0.16)",
    soft: "rgba(244, 242, 250, 0.1)",
  };

  const primaryTextLight = primaryTextOnSurface(primary, "light");
  const primaryTextDark = primaryTextOnSurface(primary, "dark");
  const softLight = primarySoftToken(primary, "light");
  const softDark = primarySoftToken(primary, "dark");

  // Default (SSR) follows explicit mode; system falls back to light + CSS media for dark
  const base = theme.mode === "dark" ? dark : light;
  const primaryText = theme.mode === "dark" ? primaryTextDark : primaryTextLight;
  const primarySoft = theme.mode === "dark" ? softDark : softLight;

  const style = {
    ["--t-primary" as string]: primary,
    ["--t-accent" as string]: accent,
    ["--t-on-primary" as string]: onPrimary,
    ["--t-primary-text" as string]: primaryText,
    ["--t-primary-text-light" as string]: primaryTextLight,
    ["--t-primary-text-dark" as string]: primaryTextDark,
    ["--t-primary-soft" as string]: primarySoft,
    ["--t-primary-soft-light" as string]: softLight,
    ["--t-primary-soft-dark" as string]: softDark,
    ["--t-accent-soft" as string]: primarySoftToken(accent, theme.mode === "dark" ? "dark" : "light"),
    ["--t-bg" as string]: base.bg,
    ["--t-surface" as string]: base.surface,
    ["--t-ink" as string]: base.ink,
    ["--t-muted" as string]: base.muted,
    ["--t-border" as string]: base.border,
    ["--t-soft" as string]: base.soft,
    ["--t-radius" as string]: radius,
    ["--t-radius-sm" as string]: `max(6px, calc(${radius} * 0.55))`,
    ["--t-radius-lg" as string]: `max(14px, calc(${radius} * 1.25))`,
    ["--t-font" as string]: font,
    // Override platform shell font so Tailwind font-sans matches tenant pick
    ["--font-sans" as string]: font,
    // Light tokens (for system mode media query in CSS)
    ["--t-light-bg" as string]: light.bg,
    ["--t-light-surface" as string]: light.surface,
    ["--t-light-ink" as string]: light.ink,
    ["--t-light-muted" as string]: light.muted,
    ["--t-light-border" as string]: light.border,
    ["--t-light-soft" as string]: light.soft,
    ["--t-dark-bg" as string]: dark.bg,
    ["--t-dark-surface" as string]: dark.surface,
    ["--t-dark-ink" as string]: dark.ink,
    ["--t-dark-muted" as string]: dark.muted,
    ["--t-dark-border" as string]: dark.border,
    ["--t-dark-soft" as string]: dark.soft,
    fontFamily: font,
    backgroundColor: "var(--t-bg)",
    color: "var(--t-ink)",
  } as CSSProperties;

  return {
    theme: { ...theme, fontFamily: fontId },
    style,
    primary,
    accent,
    onPrimary,
    radius,
    googleFontsHref: googleFontsHref(fontId),
  };
}
