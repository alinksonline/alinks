/**
 * Tenant Google Calendar OAuth (offline refresh) — FREE capability.
 * Separate redirect from login OAuth so scopes don't collide with sign-in.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getEnv } from "@/core/config/env";

const STATE_COOKIE = "alinks_gcal_oauth_state";

/**
 * Calendar write (events) + freebusy/read for busy-slot checks.
 * offline access_type for refresh_token; prompt=consent forces refresh on re-connect.
 */
export const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export function googleCalendarRedirectUri(): string {
  return `${getEnv().NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`;
}

export function isGoogleCalendarOAuthConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}

/**
 * Start OAuth for a tenant business. State binds businessId (signed cookie).
 */
export function buildGoogleCalendarAuthUrl(businessId: string): string {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID) throw new Error("Google OAuth is not configured");

  const nonce = randomBytes(16).toString("hex");
  const payload = `${businessId}.${nonce}`;
  const sig = createHmac("sha256", env.GOOGLE_CLIENT_SECRET || nonce)
    .update(payload)
    .digest("hex");

  cookies().set(STATE_COOKIE, `${payload}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleCalendarRedirectUri(),
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: nonce,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Returns businessId if cookie state matches OAuth state nonce. */
export function consumeGoogleCalendarOAuthState(oauthState: string): string | null {
  const raw = cookies().get(STATE_COOKIE)?.value;
  cookies().delete(STATE_COOKIE);
  if (!raw || !oauthState) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [businessId, nonce, sig] = parts;
  if (!businessId || !nonce || !sig || nonce !== oauthState) return null;

  const env = getEnv();
  const payload = `${businessId}.${nonce}`;
  const expected = createHmac("sha256", env.GOOGLE_CLIENT_SECRET || nonce)
    .update(payload)
    .digest("hex");

  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  return businessId;
}

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export async function exchangeGoogleCalendarCode(code: string): Promise<{
  ok: boolean;
  accessToken?: string;
  refreshToken?: string;
  email?: string;
  error?: string;
}> {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return { ok: false, error: "Google OAuth is not configured" };
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleCalendarRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenData.access_token) {
    return {
      ok: false,
      error: tokenData.error_description ?? tokenData.error ?? "Token exchange failed",
    };
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const user = (await userRes.json()) as { email?: string };
  if (!userRes.ok || !user.email) {
    return { ok: false, error: "Could not read Google account email" };
  }

  return {
    ok: true,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    email: user.email.toLowerCase(),
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  ok: boolean;
  accessToken?: string;
  error?: string;
}> {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return { ok: false, error: "Google OAuth is not configured" };
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenData.access_token) {
    return {
      ok: false,
      error: tokenData.error_description ?? tokenData.error ?? "Refresh failed",
    };
  }

  return { ok: true, accessToken: tokenData.access_token };
}
