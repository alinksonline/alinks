/** Indian mobile: exactly 10 digits, first digit 6–9. No +91 in the field. */
export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

const TEN_DIGIT_ERROR = "Enter exactly 10 digits (e.g. 9160425142). Do not add +91 before your number.";

/** Controlled input: digits only, capped at 10 — no +91, no spaces stored. */
export function sanitizeTenDigitPhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/** Strict validation — input must already be exactly 10 digits. No auto-fix. */
export function isExactlyTenDigitMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && INDIAN_MOBILE_PATTERN.test(digits);
}

export function tenDigitMobileError(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return "Mobile number is required";
  if (digits.length < 10) return `Enter all 10 digits (${digits.length}/10)`;
  if (digits.length > 10) return TEN_DIGIT_ERROR;
  if (!INDIAN_MOBILE_PATTERN.test(digits)) return "Indian mobile must start with 6, 7, 8, or 9";
  return null;
}

/** Returns 10-digit local number or throws. */
export function requireTenDigitMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!isExactlyTenDigitMobile(digits)) {
    throw new Error(tenDigitMobileError(phone) ?? TEN_DIGIT_ERROR);
  }
  return digits;
}

/** MSG91 v5 OTP API: 91 + exactly 10 local digits */
export function toMsg91Mobile(phone: string): string {
  return `91${requireTenDigitMobile(phone)}`;
}

/** MSG91 OTP Widget identifier: country code without + (e.g. 919160425142) */
export function toMsg91WidgetIdentifier(phone: string): string {
  return toMsg91Mobile(phone);
}