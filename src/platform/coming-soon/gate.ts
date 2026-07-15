/**
 * Coming-soon gate for the marketing apex (alinks.online).
 * Pure helpers — safe for Edge middleware.
 */

export const COMING_SOON_COOKIE = "alinks_preview";
export const COMING_SOON_PATH = "/coming-soon";

/** Paths always reachable while the gate is on (no IP check). */
const EXEMPT_PREFIXES = [
  COMING_SOON_PATH,
  /** Unlisted partner/tech docs — not advertised on marketing */
  "/32",
  "/docs",
  "/api/health",
  "/favicon.ico",
  "/icon.png",
  "/manifest.webmanifest",
];

export function stripPort(host: string): string {
  return (host.split(":")[0] ?? host).toLowerCase();
}

/**
 * True for apex marketing hosts only (not app.*, not tenant subdomains).
 * www is treated as marketing apex.
 */
export function isComingSoonApexHost(
  hostname: string,
  marketingHost: string,
  rootDomain: string,
): boolean {
  const h = stripPort(hostname);
  const marketing = stripPort(marketingHost);
  const root = stripPort(rootDomain);
  if (!h || h === "localhost" || h.endsWith(".localhost")) return false;

  const candidates = new Set(
    [marketing, root, marketing.startsWith("www.") ? marketing.slice(4) : `www.${marketing}`, root.startsWith("www.") ? root.slice(4) : `www.${root}`].filter(
      Boolean,
    ),
  );
  return candidates.has(h);
}

export function isComingSoonPathExempt(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Prefer Cloudflare / proxy headers (left-most forwarded IP is the client). */
export function getClientIp(headers: Headers): string | null {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return normalizeIp(cf);

  const real = headers.get("x-real-ip")?.trim();
  if (real) return normalizeIp(real);

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }

  return null;
}

/** Normalize IPv4-mapped IPv6 and strip brackets. */
export function normalizeIp(ip: string): string {
  let v = ip.trim().toLowerCase();
  if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1);
  if (v.startsWith("::ffff:")) v = v.slice(7);
  return v;
}

export function parseWhitelist(raw: string | undefined | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,;]+/)
    .map((s) => normalizeIp(s))
    .filter(Boolean);
}

export function isIpWhitelisted(ip: string | null, whitelist: string[]): boolean {
  if (!ip || whitelist.length === 0) return false;
  const n = normalizeIp(ip);
  return whitelist.some((w) => w === n);
}

export function isComingSoonEnabled(envValue: string | undefined | null): boolean {
  const v = (envValue ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export function previewQueryMatches(
  searchParams: URLSearchParams,
  secret: string | undefined | null,
): boolean {
  const s = secret?.trim();
  if (!s) return false;
  const q = searchParams.get("preview") ?? searchParams.get("access") ?? "";
  return q === s;
}

export function previewCookieMatches(
  cookieValue: string | undefined | null,
  secret: string | undefined | null,
): boolean {
  const s = secret?.trim();
  if (!s) return false;
  return (cookieValue ?? "") === s;
}
