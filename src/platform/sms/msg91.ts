import { getEnv } from "@/core/config/env";

type Msg91Response = { type?: string; message?: string; request_id?: string };

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

export async function sendLoginOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  const env = getEnv();
  if (!env.MSG91_AUTH_KEY || !env.MSG91_OTP_TEMPLATE_ID) {
    return { ok: false, error: "SMS provider not configured" };
  }

  let mobile: string;
  try {
    mobile = toMsg91Mobile(phone);
  } catch {
    return { ok: false, error: "Enter a valid 10-digit Indian phone number" };
  }

  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("authkey", env.MSG91_AUTH_KEY);
  url.searchParams.set("template_id", env.MSG91_OTP_TEMPLATE_ID);
  url.searchParams.set("mobile", mobile);
  if (env.MSG91_SENDER_ID) url.searchParams.set("sender", env.MSG91_SENDER_ID);

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) return { ok: false, error: "Could not send OTP. Try again." };

  const data = (await res.json()) as Msg91Response;
  if (data.type === "success") return { ok: true };

  return { ok: false, error: data.message ?? "Could not send OTP" };
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

  const url = new URL("https://control.msg91.com/api/v5/otp/verify");
  url.searchParams.set("authkey", env.MSG91_AUTH_KEY);
  url.searchParams.set("mobile", mobile);
  url.searchParams.set("otp", otp.trim());

  const res = await fetch(url.toString());
  if (!res.ok) return { ok: false, error: "Invalid OTP" };

  const data = (await res.json()) as Msg91Response;
  if (data.type === "success") return { ok: true };

  return { ok: false, error: data.message ?? "Invalid OTP" };
}