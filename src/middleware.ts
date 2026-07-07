import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRequest } from "@/platform/routing/resolve-request";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|uploads).*)"],
};

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

  return NextResponse.next({ request: { headers: requestHeaders } });
}