import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getEnv } from "@/core/config/env";

const STATE_COOKIE = "alinks_google_oauth_state";

export function googleRedirectUri(): string {
  return `${getEnv().NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(): string {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID) throw new Error("Google sign-in is not configured");

  const state = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", env.GOOGLE_CLIENT_SECRET || state)
    .update(state)
    .digest("hex");

  cookies().set(STATE_COOKIE, `${state}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function verifyGoogleOAuthState(state: string): boolean {
  const raw = cookies().get(STATE_COOKIE)?.value;
  cookies().delete(STATE_COOKIE);
  if (!raw || !state) return false;

  const [storedState, sig] = raw.split(".");
  if (!storedState || !sig || storedState !== state) return false;

  const env = getEnv();
  const expected = createHmac("sha256", env.GOOGLE_CLIENT_SECRET || storedState)
    .update(storedState)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  email?: string;
  name?: string;
  email_verified?: boolean;
};

export async function exchangeGoogleCode(code: string): Promise<{
  ok: boolean;
  email?: string;
  name?: string;
  error?: string;
}> {
  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return { ok: false, error: "Google sign-in is not configured" };
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenData.access_token) {
    return { ok: false, error: tokenData.error_description ?? tokenData.error ?? "Google token exchange failed" };
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const user = (await userRes.json()) as GoogleUserInfo;
  if (!userRes.ok || !user.email) {
    return { ok: false, error: "Could not read your Google account email" };
  }
  if (user.email_verified === false) {
    return { ok: false, error: "Your Google email is not verified" };
  }

  return { ok: true, email: user.email.toLowerCase(), name: user.name };
}