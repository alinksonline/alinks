"use client";

import { AlinksLogo, type AlinksLogoProps } from "./alinks-logo";
import { useTheme } from "./theme-provider";

export function ThemeAwareLogo(props: Omit<AlinksLogoProps, "variant">) {
  const { resolvedTheme } = useTheme();
  return <AlinksLogo {...props} variant={resolvedTheme === "dark" ? "dark" : "light"} />;
}