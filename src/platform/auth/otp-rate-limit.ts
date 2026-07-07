const SEND_COOLDOWN_MS = 45_000;
const lastSendByPhone = new Map<string, number>();

export function canSendOtp(phone: string): { ok: true } | { ok: false; waitSeconds: number } {
  const key = phone.replace(/\D/g, "").slice(-10);
  const last = lastSendByPhone.get(key);
  if (!last) return { ok: true };
  const elapsed = Date.now() - last;
  if (elapsed >= SEND_COOLDOWN_MS) return { ok: true };
  return { ok: false, waitSeconds: Math.ceil((SEND_COOLDOWN_MS - elapsed) / 1000) };
}

export function recordOtpSend(phone: string): void {
  const key = phone.replace(/\D/g, "").slice(-10);
  lastSendByPhone.set(key, Date.now());
}