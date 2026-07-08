/**
 * MSG91 OTP Widget — server verify.
 * Port of MSG91 dashboard snippet:
 *   POST https://control.msg91.com/api/v5/widget/verifyAccessToken
 *   body: { authkey, "access-token": "<jwt from verifyOtp>" }
 */

import { getEnv } from "@/core/config/env";
import { requireTenDigitMobile } from "@/core/utils/phone";

type VerifyAccessTokenResponse = {
  type?: string;
  message?: string;
  code?: number | string;
  mobile?: string | number;
  identifier?: string;
};

function phoneFromWidgetIdentifier(identifier: string): string {
  const digits = String(identifier).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export async function verifyMsg91WidgetAccessToken(accessToken: string): Promise<{
  ok: boolean;
  phone?: string;
  error?: string;
}> {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY) {
    return { ok: false, error: "MSG91 server auth is not configured" };
  }
  if (!accessToken.trim()) {
    return { ok: false, error: "Missing MSG91 access token" };
  }

  const res = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      authkey: env.MSG91_AUTH_KEY,
      "access-token": accessToken.trim(),
    }),
  });

  const data = (await res.json()) as VerifyAccessTokenResponse;
  if (data.type === "success") {
    const raw = data.mobile ?? data.identifier;
    if (!raw) {
      return { ok: false, error: "MSG91 verified token but no mobile was returned" };
    }
    try {
      const phone = requireTenDigitMobile(phoneFromWidgetIdentifier(String(raw)));
      return { ok: true, phone };
    } catch {
      return { ok: false, error: "MSG91 returned an invalid mobile number" };
    }
  }

  return { ok: false, error: data.message ?? "MSG91 access token verification failed" };
}