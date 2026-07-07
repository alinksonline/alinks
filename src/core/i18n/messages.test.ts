import { describe, expect, it } from "vitest";
import { SUPPORTED_LOCALES, t } from "./messages";

describe("i18n messages", () => {
  it("supports 7 locales", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(7);
  });

  it("returns Hindi dashboard title", () => {
    expect(t("hi", "dashboard.title")).toContain("डैशबोर्ड");
  });
});