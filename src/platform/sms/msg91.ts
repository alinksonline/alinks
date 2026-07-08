import { getEnv } from "@/core/config/env";
import { toMsg91Mobile } from "@/core/utils/phone";

type Msg91Response = { type?: string; message?: string; request_id?: string };

import { isMsg91ApiConfigured, type OtpDeliveryMode } from "@/platform/sms/otp-mode";

export type { OtpDeliveryMode };
export type LegacyOtpDeliveryMode = "msg91" | "dev";

function msg91ConfigError(): string | null {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY || !env.MSG91_OTP_TEMPLATE_ID) return null;
  if (env.MSG91_OTP_TEMPLATE_ID === env.MSG91_AUTH_KEY) {
    return "MSG91_OTP_TEMPLATE_ID must be the ALINKS_Signup_OTP template ID from MSG91 → OTP → Templates — not the API Auth Key.";
  }
  return null;
}

export function isMsg91Configured(): boolean {
  return isMsg91ApiConfigured() && !msg91ConfigError();
}

function formatMsg91Error(status: number, message?: string): string {
  const code = message?.match(/\b(\d{3})\b/)?.[1] ?? (status === 400 ? "400" : undefined);
  if (code === "400") {
    return "MSG91 rejected the request (400): template ID missing or invalid. In MSG91 → OTP → ALINKS_Signup_OTP → Edit, add your TRAI DLT Template ID, save, then click Test DLT until the test SMS arrives.";
  }
  if (code === "207") return "MSG91 auth key is invalid. Regenerate it under MSG91 → API and update MSG91_AUTH_KEY.";
  if (code === "211") return "MSG91 DLT template ID is missing. Ensure ALINKS_Signup_OTP is active and DLT-mapped (use Test DLT in dashboard).";
  if (code === "301") return "MSG91 account balance is too low to send SMS.";
  if (message?.toLowerCase().includes("no otp request")) {
    return "No active OTP session on MSG91. Tap Send OTP again from the previous step.";
  }
  return message ?? `SMS gateway error (${status})`;
}

export function isMsg91RetrySessionMissing(error?: string): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return lower.includes("no otp request") || lower.includes("retryotp");
}

async function parseMsg91Response(res: Response): Promise<Msg91Response> {
  const text = await res.text();
  try {
    return JSON.parse(text) as Msg91Response;
  } catch {
    return { type: "error", message: text.slice(0, 200) || "Unexpected SMS provider response" };
  }
}

export async function sendLoginOtp(phone: string): Promise<{
  ok: boolean;
  mode?: LegacyOtpDeliveryMode;
  requestId?: string;
  error?: string;
}> {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY || !env.MSG91_OTP_TEMPLATE_ID) {
    return { ok: false, error: "SMS provider not configured" };
  }
  const configError = msg91ConfigError();
  if (configError) return { ok: false, error: configError };

  let mobile: string;
  try {
    mobile = toMsg91Mobile(phone);
  } catch {
    return { ok: false, error: "Enter exactly 10 digits — no +91 or country code" };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("authkey", env.MSG91_AUTH_KEY);
  url.searchParams.set("template_id", env.MSG91_OTP_TEMPLATE_ID);
  url.searchParams.set("mobile", mobile);
  if (env.MSG91_SENDER_ID) url.searchParams.set("sender", env.MSG91_SENDER_ID);

  const res = await fetch(url.toString(), { method: "POST" });
  const data = await parseMsg91Response(res);

  if (!res.ok) {
    return { ok: false, error: formatMsg91Error(res.status, data.message) };
  }
  if (data.type === "success") {
    return { ok: true, mode: "msg91" as const, requestId: data.request_id };
  }

  return { ok: false, error: formatMsg91Error(res.status, data.message) };
}

export async function resendLoginOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY) return { ok: false, error: "SMS provider not configured" };

  let mobile: string;
  try {
    mobile = toMsg91Mobile(phone);
  } catch {
    return { ok: false, error: "Invalid phone number" };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp/retry");
  url.searchParams.set("authkey", env.MSG91_AUTH_KEY);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("retrytype", "text");

  const res = await fetch(url.toString(), { method: "POST" });
  const data = await parseMsg91Response(res);
  if (data.type === "success") return { ok: true };
  return { ok: false, error: formatMsg91Error(res.status, data.message) };
}

export async function verifyLoginOtp(phone: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY) return { ok: false, error: "SMS provider not configured" };

  let mobile: string;
  try {
    mobile = toMsg91Mobile(phone);
  } catch {
    return { ok: false, error: "Invalid phone number" };
  }

  const code = otp.replace(/\D/g, "");
  if (code.length < 4 || code.length > 6) {
    return { ok: false, error: "Enter the 4–6 digit OTP from your SMS" };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp/verify");
  url.searchParams.set("authkey", env.MSG91_AUTH_KEY);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("otp", code);

  const res = await fetch(url.toString());
  const data = await parseMsg91Response(res);

  if (data.type === "success") return { ok: true };
  return { ok: false, error: data.message ?? "Invalid or expired OTP" };
}