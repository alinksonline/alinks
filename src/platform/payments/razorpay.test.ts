import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { verifyRazorpaySignature } from "./razorpay";
import { encryptSecret, decryptSecret } from "./secret-box";

describe("verifyRazorpaySignature", () => {
  it("returns true for a valid HMAC with explicit secret", () => {
    const secret = "test_secret_key";
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verifyRazorpaySignature(orderId, paymentId, signature, secret)).toBe(true);
  });

  it("returns false for a mismatched signature", () => {
    expect(verifyRazorpaySignature("order_1", "pay_1", "invalid_signature", "test_secret_key")).toBe(false);
  });
});

describe("secret-box", () => {
  it("round-trips secrets", () => {
    const plain = "rzp_test_secret_value_12345";
    const enc = encryptSecret(plain);
    expect(enc).not.toContain(plain);
    expect(decryptSecret(enc)).toBe(plain);
  });
});
