import { describe, expect, it } from "vitest";
import { assertSubdomainAccess } from "./subdomain-gate";

describe("subdomain gate", () => {
  it("allows path mode for basic", () => {
    expect(assertSubdomainAccess("basic", "path").allowed).toBe(true);
  });

  it("blocks subdomain for basic", () => {
    expect(assertSubdomainAccess("basic", "subdomain").allowed).toBe(false);
  });

  it("allows subdomain for pro", () => {
    expect(assertSubdomainAccess("pro", "subdomain").allowed).toBe(true);
  });
});