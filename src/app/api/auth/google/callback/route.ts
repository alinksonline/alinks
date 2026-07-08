import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/core/config/env";
import { exchangeGoogleCode, verifyGoogleOAuthState } from "@/platform/auth/google-oauth";
import { createSessionFromEmail } from "@/platform/auth/session";
import { getPlatformDb } from "@/platform/db/client";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(`${getEnv().NEXT_PUBLIC_APP_URL}/login?error=google_denied`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !verifyGoogleOAuthState(state)) {
    return NextResponse.redirect(`${getEnv().NEXT_PUBLIC_APP_URL}/login?error=google_state`);
  }

  const google = await exchangeGoogleCode(code);
  if (!google.ok || !google.email) {
    return NextResponse.redirect(
      `${getEnv().NEXT_PUBLIC_APP_URL}/login?error=google_failed`,
    );
  }

  if (!getPlatformDb()) {
    return NextResponse.redirect(`${getEnv().NEXT_PUBLIC_APP_URL}/login?error=db_missing`);
  }

  try {
    const role = await createSessionFromEmail(google.email, { email: google.email, name: google.name });
    const dest = role === "superadmin" ? "/superadmin" : "/dashboard";
    return NextResponse.redirect(`${getEnv().NEXT_PUBLIC_APP_URL}${dest}`);
  } catch {
    return NextResponse.redirect(`${getEnv().NEXT_PUBLIC_APP_URL}/login?error=session_failed`);
  }
}

export const dynamic = "force-dynamic";