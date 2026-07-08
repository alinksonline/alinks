import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getEnv } from "@/core/config/env";
import { isResendConfigured } from "@/platform/auth/auth-mode";
import { canSendOtp, recordOtpSend } from "@/platform/auth/otp-rate-limit";
import {
  generateEmailOtpCode,
  setEmailOtpCookie,
  verifyEmailOtpCookie,
} from "@/platform/email/email-otp-cookie";
import { sendLoginOtpEmail } from "@/platform/email/resend";
import { verifyMsg91WidgetAccessToken } from "@/platform/sms/msg91-widget-server";
import type { OtpDeliveryMode } from "@/platform/sms/otp-mode";
import { getOtpDeliveryMode, isMsg91ApiConfigured, isMsg91WidgetConfigured } from "@/platform/sms/otp-mode";
import { isMsg91RetrySessionMissing, resendLoginOtp, sendLoginOtp, verifyLoginOtp } from "@/platform/sms/msg91";
import type { Session, SessionRole } from "@/core/types/auth";
import { isPlaceholderTenantEmail, isValidEmail, normalizeEmail } from "@/core/utils/email";
import { syntheticPhoneForEmail } from "@/core/utils/synthetic-phone";
import { requireTenDigitMobile, tenDigitMobileError } from "@/core/utils/phone";
import { getPlatformDb } from "@/platform/db/client";
import { sessions, tenants } from "@/platform/db/schema";

export type TenantSignupProfile = {
  email?: string;
  name?: string;
};

const SESSION_COOKIE = "alinks_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizePhone(phone: string): string {
  return requireTenDigitMobile(phone);
}

function resolveSessionRole(email: string, phone: string): SessionRole {
  const env = getEnv();
  if (env.SUPERADMIN_EMAIL && normalizeEmail(email) === normalizeEmail(env.SUPERADMIN_EMAIL)) {
    return "superadmin";
  }
  try {
    if (normalizePhone(phone) === normalizePhone(env.SUPERADMIN_PHONE)) return "superadmin";
  } catch {
    // phone may be synthetic for email-only accounts
  }
  return "tenant";
}

async function persistSession(tenantId: string, role: SessionRole): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  await db.insert(sessions).values({
    tenantId,
    tokenHash: hashToken(token),
    role,
    expiresAt,
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSessionFromEmail(
  email: string,
  profile?: TenantSignupProfile,
): Promise<SessionRole> {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) throw new Error("Invalid email address");

  const phone = syntheticPhoneForEmail(normalizedEmail);
  const role = resolveSessionRole(normalizedEmail, phone);

  const existing = await db.select().from(tenants).where(eq(tenants.email, normalizedEmail)).limit(1);
  let tenant = existing[0];

  if (!tenant) {
    const [created] = await db
      .insert(tenants)
      .values({
        email: normalizedEmail,
        phone,
        name: profile?.name?.trim() || (role === "superadmin" ? "ALINKS Superadmin" : "New Tenant"),
        tier: role === "superadmin" ? "enterprise" : "basic",
        status: "active",
      })
      .returning();
    tenant = created;
  } else if (profile?.name?.trim() && (!tenant.name || tenant.name === "New Tenant")) {
    await db
      .update(tenants)
      .set({ name: profile.name.trim(), updatedAt: new Date() })
      .where(eq(tenants.id, tenant.id));
  }

  await persistSession(tenant.id, role);
  return role;
}

export async function createSession(phone: string, profile?: TenantSignupProfile): Promise<SessionRole> {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  const normalized = normalizePhone(phone);
  const signupEmail = profile?.email ? normalizeEmail(profile.email) : undefined;
  if (signupEmail && !isValidEmail(signupEmail)) {
    throw new Error("Invalid email address");
  }

  const role = resolveSessionRole(signupEmail ?? `${normalized}@alinks.local`, normalized);

  if (signupEmail) {
    const emailTaken = await db.select().from(tenants).where(eq(tenants.email, signupEmail)).limit(1);
    if (emailTaken[0] && emailTaken[0].phone !== normalized) {
      throw new Error("This email is already registered to another account");
    }
  }

  const existing = await db.select().from(tenants).where(eq(tenants.phone, normalized)).limit(1);
  let tenant = existing[0];

  if (!tenant) {
    const [created] = await db
      .insert(tenants)
      .values({
        email: signupEmail ?? `${normalized}@alinks.local`,
        phone: normalized,
        name: profile?.name?.trim() || (role === "superadmin" ? "ALINKS Superadmin" : "New Tenant"),
        tier: role === "superadmin" ? "enterprise" : "basic",
        status: "active",
      })
      .returning();
    tenant = created;
  } else if (signupEmail && isPlaceholderTenantEmail(tenant.email)) {
    await db
      .update(tenants)
      .set({
        email: signupEmail,
        name: profile?.name?.trim() || tenant.name,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenant.id));
  } else if (profile?.name?.trim() && tenant.name === "New Tenant") {
    await db
      .update(tenants)
      .set({ name: profile.name.trim(), updatedAt: new Date() })
      .where(eq(tenants.id, tenant.id));
  }

  await persistSession(tenant.id, role);
  return role;
}

export async function getSession(): Promise<Session | null> {
  const db = getPlatformDb();
  if (!db) return null;

  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      userId: tenants.id,
      phone: tenants.phone,
      role: sessions.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
    .where(eq(sessions.tokenHash, hashToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row || row.expiresAt < new Date()) return null;

  return {
    userId: row.userId,
    phone: row.phone,
    role: row.role as SessionRole,
  };
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireSuperadmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.role !== "superadmin") redirect("/dashboard");
  return session;
}

export async function destroySession(): Promise<void> {
  const db = getPlatformDb();
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (db && token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  cookies().delete(SESSION_COOKIE);
}

export async function sendOtp(phone: string): Promise<{
  ok: boolean;
  mode?: OtpDeliveryMode;
  error?: string;
}> {
  const env = getEnv();
  const phoneError = tenDigitMobileError(phone);
  if (phoneError) {
    return { ok: false, error: phoneError };
  }

  const rate = canSendOtp(phone);
  if (!rate.ok) {
    return { ok: false, error: `Wait ${rate.waitSeconds}s before requesting another OTP` };
  }

  if (isMsg91ApiConfigured() && getOtpDeliveryMode() === "msg91-api") {
    const sms = await sendLoginOtp(phone);
    if (sms.ok) recordOtpSend(phone);
    return sms.ok ? { ok: true, mode: "msg91-api" as const } : { ok: false, error: sms.error };
  }

  if (isResendConfigured()) {
    return {
      ok: false,
      error: "Use email login — enter your email address instead of mobile.",
    };
  }

  if (env.NODE_ENV === "production") {
    return {
      ok: false,
      error: "Login is not configured. Add RESEND_API_KEY on Vercel (free email OTP).",
    };
  }

  recordOtpSend(phone);
  return { ok: true, mode: "dev" };
}

export async function sendEmailOtp(email: string): Promise<{
  ok: boolean;
  mode?: "email" | "dev";
  error?: string;
}> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const rate = canSendOtp(normalized);
  if (!rate.ok) {
    return { ok: false, error: `Wait ${rate.waitSeconds}s before requesting another code` };
  }

  const env = getEnv();
  if (!isResendConfigured()) {
    if (env.NODE_ENV === "production") {
      return {
        ok: false,
        error: "Email login is not configured. Add RESEND_API_KEY on Vercel.",
      };
    }
    recordOtpSend(normalized);
    return { ok: true, mode: "dev" };
  }

  const code = generateEmailOtpCode();
  const sent = await sendLoginOtpEmail(normalized, code);
  if (!sent.ok) return { ok: false, error: sent.error };

  setEmailOtpCookie(normalized, code);
  recordOtpSend(normalized);
  return { ok: true, mode: "email" };
}

export async function resendEmailOtp(email: string): Promise<{
  ok: boolean;
  mode?: "email" | "dev";
  error?: string;
}> {
  return sendEmailOtp(email);
}

export async function verifyEmailOtp(
  email: string,
  otp: string,
  profile?: TenantSignupProfile,
): Promise<{ ok: boolean; role?: SessionRole; error?: string }> {
  const normalized = normalizeEmail(email);
  const env = getEnv();

  if (isResendConfigured()) {
    if (!verifyEmailOtpCookie(normalized, otp)) {
      return { ok: false, error: "Invalid or expired code — check your email or request a new one" };
    }
  } else if (env.NODE_ENV === "production") {
    return { ok: false, error: "Email login is not configured" };
  } else if (otp.replace(/\D/g, "") !== env.DEV_OTP.replace(/\D/g, "")) {
    return { ok: false, error: "Invalid OTP" };
  }

  if (!getPlatformDb()) {
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Sign-in is temporarily unavailable — database not configured."
          : "Database not connected. Set DATABASE_URL in .env and run npm run db:migrate.",
    };
  }

  try {
    const role = await createSessionFromEmail(normalized, profile);
    return { ok: true, role };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create session. Try again." };
  }
}

export async function resendOtp(phone: string): Promise<{
  ok: boolean;
  mode?: OtpDeliveryMode;
  error?: string;
}> {
  const env = getEnv();
  const phoneError = tenDigitMobileError(phone);
  if (phoneError) {
    return { ok: false, error: phoneError };
  }

  const rate = canSendOtp(phone);
  if (!rate.ok) {
    return { ok: false, error: `Wait ${rate.waitSeconds}s before requesting another OTP` };
  }

  if (isMsg91ApiConfigured() && getOtpDeliveryMode() === "msg91-api") {
    const retry = await resendLoginOtp(phone);
    if (retry.ok) {
      recordOtpSend(phone);
      return { ok: true, mode: "msg91-api" };
    }

    if (isMsg91RetrySessionMissing(retry.error)) {
      const sms = await sendLoginOtp(phone);
      if (sms.ok) recordOtpSend(phone);
      return sms.ok ? { ok: true, mode: "msg91-api" } : { ok: false, error: sms.error };
    }

    return { ok: false, error: retry.error ?? "Could not resend OTP" };
  }

  if (isResendConfigured()) {
    return { ok: false, error: "Use email login instead of SMS." };
  }

  if (env.NODE_ENV === "production") {
    return { ok: false, error: "Login is not configured. Add RESEND_API_KEY on Vercel." };
  }

  recordOtpSend(phone);
  return { ok: true, mode: "dev" };
}

export async function verifyMsg91WidgetAndCreateSession(
  accessToken: string,
  phone: string,
  profile?: TenantSignupProfile,
): Promise<{ ok: boolean; role?: SessionRole; error?: string }> {
  if (!isMsg91WidgetConfigured()) {
    return { ok: false, error: "MSG91 widget is not configured" };
  }

  const expectedPhone = requireTenDigitMobile(phone);
  const verified = await verifyMsg91WidgetAccessToken(accessToken);
  if (!verified.ok || !verified.phone) {
    return { ok: false, error: verified.error ?? "MSG91 verification failed" };
  }
  if (verified.phone !== expectedPhone) {
    return { ok: false, error: "Verified phone does not match the number you entered" };
  }

  if (!getPlatformDb()) {
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Sign-in is temporarily unavailable — database not configured."
          : "Database not connected. Set DATABASE_URL in .env and run npm run db:migrate.",
    };
  }

  try {
    const role = await createSession(expectedPhone, profile);
    return { ok: true, role };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create session. Try again." };
  }
}

export async function verifyOtp(
  phone: string,
  otp: string,
  profile?: TenantSignupProfile,
): Promise<{ ok: boolean; role?: SessionRole; error?: string }> {
  const env = getEnv();

  if (isMsg91ApiConfigured() && getOtpDeliveryMode() === "msg91-api") {
    const sms = await verifyLoginOtp(phone, otp);
    if (!sms.ok) {
      return { ok: false, error: sms.error ?? "Invalid OTP — check the SMS code or request a new one" };
    }
  } else if (env.NODE_ENV === "production") {
    return { ok: false, error: "Login is not configured. Add RESEND_API_KEY on Vercel." };
  } else if (otp.replace(/\D/g, "") !== env.DEV_OTP.replace(/\D/g, "")) {
    return { ok: false, error: "Invalid OTP" };
  }
  if (!getPlatformDb()) {
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Sign-in is temporarily unavailable — database not configured."
          : "Database not connected. Set DATABASE_URL in .env and run npm run db:migrate.",
    };
  }
  try {
    const role = await createSession(phone, profile);
    return { ok: true, role };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create session. Try again." };
  }
}