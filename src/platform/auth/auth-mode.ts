import { getEnv } from "@/core/config/env";
import { getOtpDeliveryMode } from "@/platform/sms/otp-mode";

/** How tenants sign in: email OTP (Resend), SMS (MSG91), or local dev code. */
export type AuthLoginMode = "email" | "sms" | "dev";

export function isResendConfigured(): boolean {
  return Boolean(getEnv().RESEND_API_KEY?.trim());
}

export function isGoogleAuthConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}

/** Email OTP takes priority — free via Resend, no MSG91/DLT needed. */
export function getAuthLoginMode(): AuthLoginMode {
  if (isResendConfigured()) return "email";
  const smsMode = getOtpDeliveryMode();
  if (smsMode === "msg91-widget" || smsMode === "msg91-api") return "sms";
  return "dev";
}

export function authLoginModeLabel(mode: AuthLoginMode): string {
  if (mode === "email") return "Email OTP via Resend";
  if (mode === "sms") return "SMS OTP via MSG91";
  return "Local dev — set RESEND_API_KEY on Vercel for email login";
}