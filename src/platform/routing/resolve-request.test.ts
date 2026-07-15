import { describe, expect, it } from "vitest";
import { resolveRequest } from "./resolve-request";

describe("resolveRequest", () => {
  it("resolves marketing homepage", () => {
    const r = resolveRequest("localhost:3000", "/");
    expect(r.surface).toBe("marketing");
  });

  it("resolves platform dashboard", () => {
    const r = resolveRequest("localhost:3000", "/dashboard");
    expect(r.surface).toBe("platform");
  });

  it("resolves admin superadmin", () => {
    const r = resolveRequest("localhost:3000", "/superadmin");
    expect(r.surface).toBe("admin");
  });

  it("resolves tenant path site", () => {
    const r = resolveRequest("localhost:3000", "/demo");
    expect(r.surface).toBe("tenant-site");
    expect(r.tenantHandle).toBe("demo");
    expect(r.urlMode).toBe("path");
  });

  it("excludes reserved marketing paths", () => {
    const r = resolveRequest("localhost:3000", "/terms");
    expect(r.surface).toBe("marketing");
  });

  it("excludes grievance marketing path", () => {
    const r = resolveRequest("localhost:3000", "/grievance");
    expect(r.surface).toBe("marketing");
  });

  it("excludes docs and unlisted doc prefix from tenant handles", () => {
    expect(resolveRequest("localhost:3000", "/docs/supabase").surface).toBe("marketing");
    expect(resolveRequest("localhost:3000", "/32/doc/supabase").surface).toBe("marketing");
  });

  it("resolves pro subdomain", () => {
    const r = resolveRequest("demo.localhost:3000", "/");
    expect(r.surface).toBe("tenant-site");
    expect(r.tenantHandle).toBe("demo");
    expect(r.urlMode).toBe("subdomain");
  });

  it("resolves custom domain mode", () => {
    const r = resolveRequest("www.mysalon.com", "/");
    expect(r.surface).toBe("tenant-site");
    expect(r.urlMode).toBe("custom-domain");
  });
});