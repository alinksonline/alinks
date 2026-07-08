import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getEnv } from "@/core/config/env";
import { normalizeEmail } from "@/core/utils/email";

const COOKIE_NAME = "alinks_email_otp";
const TTL_MS = 10 * 60 * 1000;

function otpSecret(): string {
  const env = getEnv();
  return env.RESEND_API_KEY || env.MSG91_AUTH_KEY || "alinks-dev-otp-secret";
}

function hashOtp(code: string): string {
  return createHash("sha256").update(code.replace(/\D/g, "")).digest("hex");
}

export function generateEmailOtpCode(): string {
  return String(randomInt(100_000, 999_999));
}

export function setEmailOtpCookie(email: string, code: string): void {
  const normalized = normalizeEmail(email);
  const exp = Date.now() + TTL_MS;
  const payload = `${normalized}|${hashOtp(code)}|${exp}`;
  const sig = createHmac("sha256", otpSecret()).update(payload).digest("hex");
  cookies().set(COOKIE_NAME, `${payload}|${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export function verifyEmailOtpCookie(email: string, code: string): boolean {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const parts = raw.split("|");
  if (parts.length !== 4) return false;

  const [storedEmail, codeHash, expStr, sig] = parts;
  const payload = `${storedEmail}|${codeHash}|${expStr}`;
  const expectedSig = createHmac("sha256", otpSecret()).update(payload).digest("hex");

  try {
    const sigOk = timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
    if (!sigOk) return false;
  } catch {
    return false;
  }

  if (Date.now() > Number(expStr)) return false;
  if (storedEmail !== normalizeEmail(email)) return false;
  if (codeHash !== hashOtp(code)) return false;

  cookies().delete(COOKIE_NAME);
  return true;
}