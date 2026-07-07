export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "alinks-theme";

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return mode;
}