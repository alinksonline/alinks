import { describe, expect, it } from "vitest";
import { isValidHandle, normalizeHandle } from "./slug";

describe("slug utils", () => {
  it("normalizes handles", () => {
    expect(normalizeHandle("My Shop!")).toBe("my-shop");
  });

  it("rejects reserved handles", () => {
    expect(isValidHandle("admin")).toBe(false);
    expect(isValidHandle("api")).toBe(false);
  });

  it("accepts valid handles", () => {
    expect(isValidHandle("demo-salon")).toBe(true);
  });
});