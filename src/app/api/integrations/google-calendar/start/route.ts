import { NextRequest, NextResponse } from "next/server";
import {
  buildGoogleCalendarAuthUrl,
  isGoogleCalendarOAuthConfigured,
} from "@/platform/auth/google-calendar-oauth";
import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role === "superadmin") {
    return NextResponse.json({ error: "Superadmin cannot connect tenant calendars" }, { status: 403 });
  }

  try {
    await assertBusinessOwnership(businessId, session.userId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isGoogleCalendarOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth is not configured on this environment" },
      { status: 503 },
    );
  }

  const url = buildGoogleCalendarAuthUrl(businessId);
  return NextResponse.redirect(url);
}

export const dynamic = "force-dynamic";
