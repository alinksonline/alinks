import { getEnv } from "@/core/config/env";

type Msg91Response = { type?: string; message?: string; request_id?: string };

export type OtpDeliveryMode = "msg91" | "dev";

export function isMsg91Configured(): boolean {
  const env = getEnv();
  return Boolean(env.MSG91_AUTH_KEY && env.MSG91_OTP_TEMPLATE_ID);
}

function toMsg91Mobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  throw new Error("Invalid Indian phone number");
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
  mode?: OtpDeliveryMode;
  requestId?: string;
  error?: string;
}> {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY || !env.MSG91_OTP_TEMPLATE_ID) {
    return { ok: false, error: "SMS provider not configured" };
  }

  let mobile: string;
  try {
    mobile = toMsg91Mobile(phone);
  } catch {
    return { ok: false, error: "Enter a valid 10-digit Indian mobile / WhatsApp number" };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("authkey", env.MSG91_AUTH_KEY);
  url.searchParams.set("template_id", env.MSG91_OTP_TEMPLATE_ID);
  url.searchParams.set("mobile", mobile);
  if (env.MSG91_SENDER_ID) url.searchParams.set("sender", env.MSG91_SENDER_ID);

  const res = await fetch(url.toString(), { method: "POST" });
  const data = await parseMsg91Response(res);

  if (!res.ok) {
    return { ok: false, error: data.message ?? `SMS gateway error (${res.status})` };
  }
  if (data.type === "success") {
    return { ok: true, mode: "msg91", requestId: data.request_id };
  }

  return { ok: false, error: data.message ?? "Could not send OTP. Check MSG91 template & DLT status." };
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
  return { ok: false, error: data.message ?? "Could not resend OTP" };
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