import { normalizeEmail } from "@/core/utils/email";

const SEND_COOLDOWN_MS = 45_000;
const lastSendByKey = new Map<string, number>();

function otpRateKey(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return normalizeEmail(trimmed);
  return trimmed.replace(/\D/g, "").slice(-10);
}

export function canSendOtp(identifier: string): { ok: true } | { ok: false; waitSeconds: number } {
  const key = otpRateKey(identifier);
  const last = lastSendByKey.get(key);
  if (!last) return { ok: true };
  const elapsed = Date.now() - last;
  if (elapsed >= SEND_COOLDOWN_MS) return { ok: true };
  return { ok: false, waitSeconds: Math.ceil((SEND_COOLDOWN_MS - elapsed) / 1000) };
}

export function recordOtpSend(identifier: string): void {
  lastSendByKey.set(otpRateKey(identifier), Date.now());
}