import { createHmac, timingSafeEqual } from "crypto";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

export type ClientSessionPayload = { handle: string; phone: string; exp: number };

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function encodeClientSession(handle: string, phone: string, secret: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${handle}|${phone}|${exp}`;
  return `${payload}|${sign(payload, secret)}`;
}

export function decodeClientSession(
  raw: string | undefined,
  secret: string,
  expectedHandle: string,
): ClientSessionPayload | null {
  if (!raw) return null;
  const parts = raw.split("|");
  if (parts.length !== 4) return null;
  const [handle, phone, expStr, sig] = parts;
  const payload = `${handle}|${phone}|${expStr}`;
  const expected = sign(payload, secret);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  if (handle !== expectedHandle) return null;
  if (Date.now() > Number(expStr)) return null;
  if (!phone || phone.length !== 10) return null;
  return { handle, phone, exp: Number(expStr) };
}

export function encodeClientOtp(handle: string, phone: string, codeHash: string, secret: string): string {
  const exp = Date.now() + OTP_TTL_MS;
  const payload = `${handle}|${phone}|${codeHash}|${exp}`;
  return `${payload}|${sign(payload, secret)}`;
}

export function verifyClientOtpBlob(
  raw: string | undefined,
  handle: string,
  phone: string,
  codeHash: string,
  secret: string,
): boolean {
  if (!raw) return false;
  const parts = raw.split("|");
  if (parts.length !== 5) return false;
  const [h, p, storedHash, expStr, sig] = parts;
  const payload = `${h}|${p}|${storedHash}|${expStr}`;
  const expected = sign(payload, secret);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  if (h !== handle || p !== phone) return false;
  if (Date.now() > Number(expStr)) return false;
  try {
    return timingSafeEqual(Buffer.from(storedHash), Buffer.from(codeHash));
  } catch {
    return false;
  }
}

export const CLIENT_SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);
export const CLIENT_OTP_MAX_AGE = Math.floor(OTP_TTL_MS / 1000);
