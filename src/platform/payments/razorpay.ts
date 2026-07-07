import { getEnv } from "@/core/config/env";
import crypto from "crypto";

export type RazorpayOrderResult =
  | { ok: true; orderId: string; amount: number; currency: string }
  | { ok: false; error: string; status: number };

export function isRazorpayConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function getPublicRazorpayKeyId(): string | undefined {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim();
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  currency = "INR",
): Promise<RazorpayOrderResult> {
  const env = getEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return { ok: false, error: "Razorpay is not configured", status: 500 };
  }

  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    return { ok: false, error: "Amount must be at least 100 paise (₹1)", status: 400 };
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountPaise, currency, receipt }),
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
      // ignore parse errors
    }
    return { ok: false, error: message, status: 500 };
  }

  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return { ok: true, orderId: data.id, amount: data.amount, currency: data.currency };
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const env = getEnv();
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
  return expected === signature;
}

export function createDevOrderId(): string {
  return `dev_order_${crypto.randomBytes(8).toString("hex")}`;
}