import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/platform/auth/google-oauth";
import { isGoogleAuthConfigured } from "@/platform/auth/auth-mode";

export async function GET() {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  try {
    return NextResponse.redirect(buildGoogleAuthUrl());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Google sign-in failed" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";