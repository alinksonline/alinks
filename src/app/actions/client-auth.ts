"use server";

import { createHash, randomInt } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getEnv } from "@/core/config/env";
import { requireTenDigitMobile, tenDigitMobileError } from "@/core/utils/phone";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { canSendOtp, recordOtpSend } from "@/platform/auth/otp-rate-limit";
import { sendLoginOtp } from "@/platform/sms/msg91";
import {
  CLIENT_OTP_MAX_AGE,
  CLIENT_SESSION_MAX_AGE,
  decodeClientSession,
  encodeClientOtp,
  encodeClientSession,
  verifyClientOtpBlob,
} from "@/tenant/client-auth/token";

const SESSION_COOKIE = "alinks_client";
const OTP_COOKIE = "alinks_client_otp";

function secret(): string {
  const env = getEnv();
  return env.RESEND_API_KEY || env.MSG91_AUTH_KEY || "alinks-dev-client-otp";
}

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function shopExists(handle: string): Promise<boolean> {
  const db = getPlatformDb();
  if (!db) return false;
  const row = (await db.select({ id: businesses.id, isPublished: businesses.isPublished }).from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  return Boolean(row?.isPublished);
}

export async function getShopClient(handle: string): Promise<{ phone: string } | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  const parsed = decodeClientSession(raw, secret(), handle);
  return parsed ? { phone: parsed.phone } : null;
}

export async function requestShopClientOtpAction(handle: string, phoneInput: string) {
  try {
    if (!(await shopExists(handle))) return { success: false as const, error: "Shop not found" };
    let phone: string;
    try {
      phone = requireTenDigitMobile(phoneInput);
    } catch {
      return { success: false as const, error: tenDigitMobileError(phoneInput) ?? "Enter a 10-digit mobile" };
    }

    const gate = canSendOtp(`client:${handle}:${phone}`);
    if (!gate.ok) return { success: false as const, error: `Wait ${gate.waitSeconds}s before another code` };

    const code = String(randomInt(100_000, 999_999));
    const codeHash = createHash("sha256").update(code).digest("hex");
    cookies().set(OTP_COOKIE, encodeClientOtp(handle, phone, codeHash, secret()), cookieOpts(CLIENT_OTP_MAX_AGE));
    recordOtpSend(`client:${handle}:${phone}`);

    const sms = await sendLoginOtp(phone);
    if (sms.ok) return { success: true as const, delivery: "sms" as const };

    if (process.env.NODE_ENV !== "production") {
      return { success: true as const, delivery: "dev" as const };
    }
    return { success: false as const, error: sms.error ?? "Could not send OTP" };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Could not send code" };
  }
}

export async function verifyShopClientOtpAction(handle: string, phoneInput: string, codeInput: string) {
  try {
    if (!(await shopExists(handle))) return { success: false as const, error: "Shop not found" };
    const phone = requireTenDigitMobile(phoneInput);
    const code = codeInput.replace(/\D/g, "");
    const env = getEnv();
    const codeHash = createHash("sha256").update(code).digest("hex");
    const blob = cookies().get(OTP_COOKIE)?.value;
    const otpOk = verifyClientOtpBlob(blob, handle, phone, codeHash, secret());
    const devOk =
      process.env.NODE_ENV !== "production" &&
      Boolean(env.DEV_OTP) &&
      code === env.DEV_OTP.replace(/\D/g, "");
    if (!otpOk && !devOk) return { success: false as const, error: "Invalid or expired code" };

    cookies().set(SESSION_COOKIE, encodeClientSession(handle, phone, secret()), cookieOpts(CLIENT_SESSION_MAX_AGE));
    cookies().delete(OTP_COOKIE);
    return { success: true as const, phone };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Verify failed" };
  }
}

export async function logoutShopClientAction() {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(OTP_COOKIE);
  return { success: true as const };
}
