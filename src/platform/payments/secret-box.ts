import crypto from "crypto";

/**
 * Encrypt tenant payment secrets at rest.
 * Uses PAYMENTS_ENCRYPTION_KEY (preferred) or a derived key from DATABASE_URL in dev.
 */
function encryptionKey(): Buffer {
  const raw =
    process.env.PAYMENTS_ENCRYPTION_KEY?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    "alinks-dev-payments-only";
  return crypto.createHash("sha256").update(raw).digest();
}

/** Returns base64(iv:authTag:ciphertext) */
export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  if (buf.length < 12 + 16 + 1) throw new Error("Invalid secret payload");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
