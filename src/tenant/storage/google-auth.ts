import { createSign } from "crypto";
import { getEnv } from "@/core/config/env";

export type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

type TokenCache = { accessToken: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

const SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(getEnv().GOOGLE_SERVICE_ACCOUNT_JSON?.trim());
}

export function parseServiceAccountJson(raw?: string): GoogleServiceAccount | null {
  const json = (raw ?? getEnv().GOOGLE_SERVICE_ACCOUNT_JSON)?.trim();
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as GoogleServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return null;
    // Env often stores escaped newlines
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    return parsed;
  } catch {
    return null;
  }
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** JWT bearer grant for Google service account (no googleapis package). */
export async function getGoogleAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const sa = parseServiceAccountJson();
  if (!sa) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing or invalid");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SHEETS_SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = base64url(signer.sign(sa.private_key));
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? `Google token exchange failed (${res.status})`);
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

export function getServiceAccountEmail(): string | null {
  return parseServiceAccountJson()?.client_email ?? null;
}
