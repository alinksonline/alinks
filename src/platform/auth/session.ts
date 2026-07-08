import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getEnv } from "@/core/config/env";
import { canSendOtp, recordOtpSend } from "@/platform/auth/otp-rate-limit";
import { verifyMsg91WidgetAccessToken } from "@/platform/sms/msg91-widget-server";
import type { OtpDeliveryMode } from "@/platform/sms/otp-mode";
import { getOtpDeliveryMode, isMsg91ApiConfigured, isMsg91WidgetConfigured } from "@/platform/sms/otp-mode";
import { isMsg91RetrySessionMissing, resendLoginOtp, sendLoginOtp, verifyLoginOtp } from "@/platform/sms/msg91";
import type { Session, SessionRole } from "@/core/types/auth";
import { isPlaceholderTenantEmail, isValidEmail, normalizeEmail } from "@/core/utils/email";
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

export async function createSession(phone: string, profile?: TenantSignupProfile): Promise<SessionRole> {
  const db = getPlatformDb();
  if (!db) throw new Error("Database not connected");

  const env = getEnv();
  const normalized = normalizePhone(phone);
  const role: SessionRole =
    normalized === normalizePhone(env.SUPERADMIN_PHONE) ? "superadmin" : "tenant";

  const signupEmail = profile?.email ? normalizeEmail(profile.email) : undefined;
  if (signupEmail && !isValidEmail(signupEmail)) {
    throw new Error("Invalid email address");
  }

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

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    tenantId: tenant.id,
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

  if (env.NODE_ENV === "production") {
    return { ok: false, error: "SMS login is not configured. Contact support." };
  }

  recordOtpSend(phone);
  return { ok: true, mode: "dev" };
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

  if (env.NODE_ENV === "production") {
    return { ok: false, error: "SMS login is not configured. Contact support." };
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
    return { ok: false, error: "SMS login is not configured" };
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