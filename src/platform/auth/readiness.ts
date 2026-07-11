import { getEnv } from "@/core/config/env";
import { getAuthLoginMode, isGoogleAuthConfigured, isResendConfigured } from "@/platform/auth/auth-mode";
import { getPlatformDb } from "@/platform/db/client";

export type AuthReadiness = {
  database: boolean;
  loginMode: ReturnType<typeof getAuthLoginMode>;
  resend: boolean;
  google: boolean;
  devOtp: boolean;
  ready: boolean;
  blockers: string[];
};

export function getAuthReadiness(): AuthReadiness {
  const env = getEnv();
  const database = Boolean(getPlatformDb());
  const loginMode = getAuthLoginMode();
  const resend = isResendConfigured();
  const google = isGoogleAuthConfigured();
  const devOtp = Boolean(env.DEV_OTP?.trim());

  const blockers: string[] = [];
  if (!database) {
    blockers.push(
      env.NODE_ENV === "production"
        ? "DATABASE_URL missing on server — add Supabase Postgres connection string on Vercel"
        : "DATABASE_URL missing — set in .env and run npm run db:migrate",
    );
  }
  if (loginMode === "dev" && env.NODE_ENV === "production") {
    blockers.push("No auth provider configured — add RESEND_API_KEY on Vercel for email login");
  }

  const ready = blockers.length === 0;

  return { database, loginMode, resend, google, devOtp, ready, blockers };
}