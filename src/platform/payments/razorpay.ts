import crypto from "crypto";
import { getEnv } from "@/core/config/env";

export type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
};

export type RazorpayOrderResult =
  | { ok: true; orderId: string; amount: number; currency: string }
  | { ok: false; error: string; status: number };

/** Platform env keys — only for ALINKS SaaS billing, not tenant sales. */
export function isPlatformRazorpayConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

/** @deprecated use isPlatformRazorpayConfigured or tenant credentials */
export function isRazorpayConfigured(): boolean {
  return isPlatformRazorpayConfigured();
}

export function getPublicRazorpayKeyId(): string | undefined {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim();
}

function platformCredentials(): RazorpayCredentials | null {
  const env = getEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return null;
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}

/** Probe keys with a lightweight authenticated call. */
export async function validateRazorpayCredentials(
  creds: RazorpayCredentials,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (res.status === 401) {
      return { ok: false, error: "Invalid Razorpay Key ID or Secret" };
    }
    if (!res.ok) {
      return { ok: false, error: "Could not verify Razorpay credentials" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach Razorpay" };
  }
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  currency = "INR",
  credentials?: RazorpayCredentials | null,
): Promise<RazorpayOrderResult> {
  const creds = credentials ?? platformCredentials();
  if (!creds) {
    return { ok: false, error: "Razorpay is not configured for this shop", status: 500 };
  }

  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    return { ok: false, error: "Amount must be at least 100 paise (₹1)", status: 400 };
  }

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountPaise, currency, receipt: receipt.slice(0, 40) }),
  });

  if (res.status === 401) {
    return { ok: false, error: "Razorpay authentication failed", status: 401 };
  }

  if (!res.ok) {
    let message = "Failed to create Razorpay order";
    try {
      const err = (await res.json()) as { error?: { description?: string } };
      message = err.error?.description ?? message;
    } catch {
      // ignore
    }
    return { ok: false, error: message, status: 500 };
  }

  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return { ok: true, orderId: data.id, amount: data.amount, currency: data.currency };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret?: string | null,
): boolean {
  const secret = keySecret ?? getEnv().RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return expected === signature;
  }
}

export function createDevOrderId(): string {
  return `dev_order_${crypto.randomBytes(8).toString("hex")}`;
}
