import { getEnv } from "@/core/config/env";
import type { AppSurface, ResolvedRequest, TenantUrlMode } from "@/core/types/routing";

const PLATFORM_PREFIXES = ["/dashboard", "/login", "/signup", "/onboarding", "/editor", "/billing", "/api"];
const ADMIN_PREFIXES = ["/superadmin"];
const MARKETING_PATHS = new Set([
  "terms",
  "privacy",
  "aup",
  "payment-terms",
  "grievance",
  "docs",
  "coming-soon",
  /** Unlisted docs prefix — reserved, not a tenant handle */
  "32",
]);

function stripPort(host: string): string {
  return host.split(":")[0] ?? host;
}

export function resolveRequest(host: string, pathname: string): ResolvedRequest {
  const env = getEnv();
  const rootDomain = stripPort(env.NEXT_PUBLIC_ROOT_DOMAIN);
  const platformHost = stripPort(env.NEXT_PUBLIC_PLATFORM_HOST);
  const marketingHost = stripPort(env.NEXT_PUBLIC_MARKETING_HOST);
  const hostname = stripPort(host);

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) || hostname.startsWith("admin.")) {
    return { surface: "admin", host: hostname, pathname };
  }

  if (
    hostname === platformHost ||
    hostname.startsWith("app.") ||
    PLATFORM_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return { surface: "platform", host: hostname, pathname };
  }

  if (hostname === marketingHost || hostname === rootDomain) {
    const pathMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]*)(?:\/|$)/);
    if (pathMatch && !MARKETING_PATHS.has(pathMatch[1])) {
      return {
        surface: "tenant-site",
        host: hostname,
        pathname,
        tenantHandle: pathMatch[1],
        urlMode: "path",
      };
    }
    return { surface: "marketing", host: hostname, pathname };
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    if (subdomain && subdomain !== "www" && subdomain !== "app" && subdomain !== "admin") {
      return {
        surface: "tenant-site",
        host: hostname,
        pathname,
        tenantHandle: subdomain,
        urlMode: "subdomain",
      };
    }
  }

  if (hostname !== rootDomain && !hostname.endsWith(`.${rootDomain}`)) {
    return {
      surface: "tenant-site",
      host: hostname,
      pathname,
      urlMode: "custom-domain",
    };
  }

  return { surface: "marketing", host: hostname, pathname };
}