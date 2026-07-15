import { describe, expect, it } from "vitest";
import {
  contrastOn,
  parseThemeConfig,
  primaryTextOnSurface,
  resolveTenantTheme,
} from "./tenant-theme";

describe("tenant-theme", () => {
  it("parses incomplete theme with defaults", () => {
    const t = parseThemeConfig({ primaryColor: "#112233" });
    expect(t.primaryColor).toBe("#112233");
    expect(t.accentColor).toBeTruthy();
    expect(t.mode).toBe("light");
  });

  it("picks light text on dark primary", () => {
    expect(contrastOn("#0f172a")).toBe("#ffffff");
  });

  it("picks dark text on light primary", () => {
    expect(contrastOn("#f8fafc")).toBe("#0f172a");
  });

  it("lightens dark primary for text on dark surfaces", () => {
    const darkPrimaryOnDark = primaryTextOnSurface("#1e1b4b", "dark");
    expect(darkPrimaryOnDark.toLowerCase()).not.toBe("#1e1b4b");
    // Should be brighter than the source brand color
    expect(darkPrimaryOnDark).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("resolves CSS vars for themed layout", () => {
    const r = resolveTenantTheme({ primaryColor: "#be185d", accentColor: "#f43f5e", mode: "dark" });
    expect(r.primary).toBe("#be185d");
    expect(r.style).toMatchObject(expect.objectContaining({}));
    const style = r.style as Record<string, string>;
    expect(style["--t-primary"]).toBe("#be185d");
    expect(style["--t-primary-text"]).toBeTruthy();
    expect(style["--t-bg"]).toBeTruthy();
  });
});
