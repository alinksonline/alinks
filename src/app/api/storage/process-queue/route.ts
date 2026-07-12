import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/core/config/env";
import { getSession } from "@/platform/auth/session";
import { processWriteQueue } from "@/tenant/storage/write-service";

/**
 * Retry failed tenant Sheet writes.
 * Auth: CRON_SECRET bearer header, or logged-in superadmin.
 */
export async function POST(req: NextRequest) {
  const env = getEnv();
  const cronSecret = process.env.CRON_SECRET?.trim() || process.env.STORAGE_QUEUE_SECRET?.trim();
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  let allowed = Boolean(cronSecret && bearer && bearer === cronSecret);
  if (!allowed) {
    const session = await getSession();
    allowed = session?.role === "superadmin";
  }

  if (!allowed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processWriteQueue(env.NODE_ENV === "production" ? 50 : 20);
  return NextResponse.json({ ok: true, processed });
}

export const dynamic = "force-dynamic";
