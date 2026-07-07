import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { verifyRazorpaySignature } from "./razorpay";

describe("verifyRazorpaySignature", () => {
  it("returns true for a valid HMAC signature", () => {
    const secret = "test_secret_key";
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

    process.env.RAZORPAY_KEY_SECRET = secret;
    expect(verifyRazorpaySignature(orderId, paymentId, signature)).toBe(true);
  });

  it("returns false for a mismatched signature", () => {
    process.env.RAZORPAY_KEY_SECRET = "test_secret_key";
    expect(verifyRazorpaySignature("order_1", "pay_1", "invalid_signature")).toBe(false);
  });
});