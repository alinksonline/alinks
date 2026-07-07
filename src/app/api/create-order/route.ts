import { NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder, isRazorpayConfigured } from "@/platform/payments/razorpay";

const bodySchema = z.object({
  amount: z.number().int().min(100),
  currency: z.string().default("INR"),
  receipt: z.string().min(1).max(40),
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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await createRazorpayOrder(body.amount, body.receipt, body.currency);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    order_id: result.orderId,
    amount: result.amount,
    currency: result.currency,
  });
}