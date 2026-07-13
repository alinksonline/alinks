/**
 * Platform login roles — EXCLUSIVE (one account = one role).
 *
 * - tenant     = platform client (business owner). NEVER superadmin.
 * - superadmin = Artix operator only. NEVER a platform client / tenant.
 *
 * Do not invent hybrid roles. Staff job titles (stylist, doctor) are NOT
 * platform login roles — they live on staff_members under a business.
 */
export type SessionRole = "tenant" | "superadmin";

export const PLATFORM_ROLES = ["tenant", "superadmin"] as const;

export function isPlatformClient(role: SessionRole): boolean {
  return role === "tenant";
}

export function isSuperadmin(role: SessionRole): boolean {
  return role === "superadmin";
}

/** Coerce unknown DB strings; anything other than superadmin is a platform client. */
export function parseSessionRole(role: string | null | undefined): SessionRole {
  return role === "superadmin" ? "superadmin" : "tenant";
}

export interface Session {
  userId: string;
  role: SessionRole;
  phone: string;
}
