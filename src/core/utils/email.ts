export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized);
}

export function isPlaceholderTenantEmail(email: string): boolean {
  return email.endsWith("@alinks.local");
}