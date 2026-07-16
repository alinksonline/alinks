import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  canAcceptOrders,
  PRESENCE_BLOCKED_API_MESSAGE,
} from "@/core/utils/industry-gates";
import { listEntitledSkus } from "@/platform/billing/entitlements";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { requireCreateOrderIdentity } from "@/platform/payments/create-order-gate";
import { createRazorpayOrder, isRazorpayConfigured } from "@/platform/payments/razorpay";

const bodySchema = z
  .object({
    amount: z.number().int().min(100),
    currency: z.string().default("INR"),
    receipt: z.string().min(1).max(40),
    /** Tenant site handle — required with businessId (at least one). */
    handle: z.string().min(1).max(30).optional(),
    businessId: z.string().uuid().optional(),
  })
  .refine((b) => Boolean(b.handle?.trim()) || Boolean(b.businessId), {
    message: "handle or businessId required",
    path: ["handle"],
  });

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Razorpay is not configured" }, { status: 500 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    body = bodySchema.parse(json);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body. Provide amount, receipt, and handle or businessId.",
        code: "INVALID_BODY",
      },
      { status: 400 },
    );
  }

  const identity = requireCreateOrderIdentity({
    handle: body.handle,
    businessId: body.businessId,
  });
  if (!identity.ok) {
    return NextResponse.json(
      { error: identity.error, code: identity.code },
      { status: identity.status },
    );
  }

  const db = getPlatformDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  let row:
    | {
        id: string;
        vertical: string;
        industryGroup: string;
        industryType: string;
        isPublished: boolean;
      }
    | undefined;

  if (identity.businessId) {
    row = (
      await db
        .select({
          id: businesses.id,
          vertical: businesses.vertical,
          industryGroup: businesses.industryGroup,
          industryType: businesses.industryType,
          isPublished: businesses.isPublished,
        })
        .from(businesses)
        .where(eq(businesses.id, identity.businessId))
        .limit(1)
    )[0];
  } else if (identity.handle) {
    row = (
      await db
        .select({
          id: businesses.id,
          vertical: businesses.vertical,
          industryGroup: businesses.industryGroup,
          industryType: businesses.industryType,
          isPublished: businesses.isPublished,
        })
        .from(businesses)
        .where(eq(businesses.handle, identity.handle))
        .limit(1)
    )[0];
  }

  if (!row) {
    return NextResponse.json(
      { error: "Business not found", code: "BUSINESS_NOT_FOUND" },
      { status: 404 },
    );
  }

  if (!row.isPublished) {
    return NextResponse.json(
      { error: "Store is not published", code: "NOT_PUBLISHED" },
      { status: 403 },
    );
  }

  const entitledSkus = await listEntitledSkus(row.id);
  if (
    !canAcceptOrders({
      vertical: row.vertical,
      industryGroup: row.industryGroup,
      industryType: row.industryType,
      entitledSkus,
    })
  ) {
    return NextResponse.json(
      { error: PRESENCE_BLOCKED_API_MESSAGE, code: "COMMERCE_BLOCKED" },
      { status: 403 },
    );
  }

  // Platform Razorpay only when configured — tenant sales should prefer tenant keys
  // via createCheckoutSessionAction. This route remains identity-gated for any caller.
  const result = await createRazorpayOrder(body.amount, body.receipt, body.currency);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    order_id: result.orderId,
    amount: result.amount,
    currency: result.currency,
    businessId: row.id,
  });
}
