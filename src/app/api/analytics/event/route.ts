import { NextResponse } from "next/server";
import { z } from "zod";
import { isAnalyticsEventType } from "@/core/config/analytics";
import {
  recordAnalyticsEvent,
  resolvePublishedBusinessId,
} from "@/platform/analytics/service";

const bodySchema = z.object({
  handle: z.string().min(1).max(30),
  eventType: z.string().min(1).max(24),
  /** Page path or link key — no PII */
  path: z.string().min(1).max(200),
});

/**
 * Public beacon — aggregated counters only.
 * Does not log IP, cookies, or customer fields.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!isAnalyticsEventType(body.eventType)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const businessId = await resolvePublishedBusinessId(body.handle);
  if (!businessId) {
    // Soft 204 — don't leak existence for unpublished handles
    return new NextResponse(null, { status: 204 });
  }

  await recordAnalyticsEvent({
    businessId,
    eventType: body.eventType,
    pathOrLink: body.path,
  });

  return new NextResponse(null, { status: 204 });
}
