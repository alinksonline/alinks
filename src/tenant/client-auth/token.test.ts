import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import { decodeClientSession, encodeClientSession, encodeClientOtp, verifyClientOtpBlob } from "./token";

describe("client session token", () => {
  it("round-trips a shop-scoped phone session", () => {
    const raw = encodeClientSession("myshop", "9876543210", "secret");
    expect(decodeClientSession(raw, "secret", "myshop")?.phone).toBe("9876543210");
    expect(decodeClientSession(raw, "secret", "other")).toBeNull();
    expect(decodeClientSession(raw, "wrong", "myshop")).toBeNull();
  });

  it("verifies an OTP blob for that shop only", () => {
    const hash = createHash("sha256").update("111111").digest("hex");
    const blob = encodeClientOtp("myshop", "9876543210", hash, "secret");
    expect(verifyClientOtpBlob(blob, "myshop", "9876543210", hash, "secret")).toBe(true);
    expect(verifyClientOtpBlob(blob, "myshop", "9876543210", hash, "nope")).toBe(false);
  });
});
