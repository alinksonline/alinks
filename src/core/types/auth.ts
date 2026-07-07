export type SessionRole = "tenant" | "superadmin";

export interface Session {
  userId: string;
  role: SessionRole;
  phone: string;
}