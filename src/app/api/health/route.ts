import { NextResponse } from "next/server";
import { getAuthReadiness } from "@/platform/auth/readiness";

export async function GET() {
  const auth = getAuthReadiness();

  return NextResponse.json({
    ok: auth.ready,
    service: "alinks",
    timestamp: new Date().toISOString(),
    auth: {
      database: auth.database,
      loginMode: auth.loginMode,
      resend: auth.resend,
      google: auth.google,
      blockers: auth.blockers,
    },
  });
}