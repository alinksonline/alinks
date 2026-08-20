import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRequest } from "@/platform/routing/resolve-request";
import {
  COMING_SOON_COOKIE,
  COMING_SOON_PATH,
  getClientIp,
  isComingSoonApexHost,
  isComingSoonEnabled,
  isComingSoonPathExempt,
  isIpWhitelisted,
  parseWhitelist,
  previewCookieMatches,
  previewQueryMatches,
} from "@/platform/coming-soon/gate";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|uploads).*)"],
};

function marketingHostsFromEnv(): { marketing: string; root: string } {
  const root =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "localhost:3000";
  const marketing = process.env.NEXT_PUBLIC_MARKETING_HOST?.trim() || root;
  return { marketing, root };
}

function isAllowedThroughGate(req: NextRequest): boolean {
  const whitelist = parseWhitelist(process.env.COMING_SOON_WHITELIST_IPS);
  const secret = process.env.COMING_SOON_BYPASS_SECRET;
  const ip = getClientIp(req.headers);

  if (isIpWhitelisted(ip, whitelist)) return true;
  if (previewCookieMatches(req.cookies.get(COMING_SOON_COOKIE)?.value, secret)) return true;
  if (previewQueryMatches(req.nextUrl.searchParams, secret)) return true;

  // Local dev never hard-locks the machine (use env to test the page).
  if (process.env.NODE_ENV === "development") {
    const h = (req.headers.get("host") ?? "").replace(/:\d+$/, "");
    if (h === "localhost" || h === "127.0.0.1") return true;
  }

  return false;
}

/** IP/preview gates must not be CDN-cached — a HIT of /coming-soon would lock the owner out. */
function withComingSoonCache(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.headers.set("CDN-Cache-Control", "no-store");
  res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return res;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const pathname = req.nextUrl.pathname;
  const resolved = resolveRequest(host, pathname);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-alinks-surface", resolved.surface);
  if (resolved.tenantHandle) {
    requestHeaders.set("x-alinks-handle", resolved.tenantHandle);
  }
  if (resolved.urlMode) {
    requestHeaders.set("x-alinks-url-mode", resolved.urlMode);
  }

  const hostname = host.replace(/:\d+$/, "");
  const isDev = process.env.NODE_ENV === "development";
  const { marketing, root } = marketingHostsFromEnv();
  let comingSoonBypass = false;

  // —— Coming soon gate (marketing apex only) ——
  if (
    isComingSoonEnabled(process.env.COMING_SOON_ENABLED) &&
    isComingSoonApexHost(hostname, marketing, root)
  ) {
    const secret = process.env.COMING_SOON_BYPASS_SECRET?.trim();
    const wantsPreview = previewQueryMatches(req.nextUrl.searchParams, secret);

    if (wantsPreview && secret) {
      const clean = req.nextUrl.clone();
      clean.searchParams.delete("preview");
      clean.searchParams.delete("access");
      const res = NextResponse.redirect(clean);
      res.cookies.set(COMING_SOON_COOKIE, secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return withComingSoonCache(res);
    }

    const allowed = isAllowedThroughGate(req);
    if (!allowed && !isComingSoonPathExempt(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = COMING_SOON_PATH;
      url.search = "";
      return withComingSoonCache(
        NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
      );
    }
    comingSoonBypass = true;
  }

  if (isDev && hostname === "localhost") {
    if (pathname.startsWith("/app")) {
      const newPath = pathname.replace(/^\/app/, "") || "/dashboard";
      return NextResponse.rewrite(new URL(newPath, req.url), { request: { headers: requestHeaders } });
    }
    if (pathname.startsWith("/admin")) {
      const newPath = pathname.replace(/^\/admin/, "") || "/superadmin";
      return NextResponse.rewrite(new URL(newPath, req.url), { request: { headers: requestHeaders } });
    }
  }

  if (resolved.surface === "tenant-site" && resolved.urlMode === "subdomain" && resolved.tenantHandle) {
    const rest = pathname === "/" ? "" : pathname;
    return NextResponse.rewrite(new URL(`/${resolved.tenantHandle}${rest}`, req.url), {
      request: { headers: requestHeaders },
    });
  }

  if (resolved.surface === "tenant-site" && resolved.urlMode === "custom-domain") {
    return NextResponse.rewrite(new URL("/custom", req.url), { request: { headers: requestHeaders } });
  }

  const next = NextResponse.next({ request: { headers: requestHeaders } });
  return comingSoonBypass ? withComingSoonCache(next) : next;
}
