import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/core/config/env";
import {
  consumeGoogleCalendarOAuthState,
  exchangeGoogleCalendarCode,
} from "@/platform/auth/google-calendar-oauth";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { saveGoogleCalendarOAuthConnection } from "@/platform/integrations/google-calendar";

export async function GET(request: NextRequest) {
  const base = getEnv().NEXT_PUBLIC_APP_URL;
  const destOk = `${base}/dashboard/integrations/google?gcal=connected`;
  const destFail = (code: string) => `${base}/dashboard/integrations/google?gcal_error=${code}`;

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(destFail("denied"));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(destFail("missing"));
  }

  const businessId = consumeGoogleCalendarOAuthState(state);
  if (!businessId) {
    return NextResponse.redirect(destFail("state"));
  }

  const session = await getSession();
  if (!session || session.role === "superadmin") {
    return NextResponse.redirect(destFail("auth"));
  }

  try {
    await assertBusinessOwnership(businessId, session.userId);
  } catch {
    return NextResponse.redirect(destFail("ownership"));
  }

  const google = await exchangeGoogleCalendarCode(code);
  if (!google.ok || !google.email) {
    return NextResponse.redirect(destFail("token"));
  }

  const saved = await saveGoogleCalendarOAuthConnection({
    businessId,
    googleEmail: google.email,
    refreshToken: google.refreshToken,
  });

  if (!saved.ok) {
    return NextResponse.redirect(destFail("save"));
  }

  return NextResponse.redirect(destOk);
}

export const dynamic = "force-dynamic";
