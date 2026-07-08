import { createHash } from "crypto";
import { normalizeEmail } from "@/core/utils/email";

/** Stable 10-digit placeholder for email-only accounts (DB requires unique phone). */
export function syntheticPhoneForEmail(email: string): string {
  const hex = createHash("sha256").update(normalizeEmail(email)).digest("hex");
  const digits = hex
    .split("")
    .map((c) => String(parseInt(c, 16) % 10))
    .join("");
  return (`9${digits}`).slice(0, 10);
}