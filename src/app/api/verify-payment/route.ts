import { NextResponse } from "next/server";
import { z } from "zod";
import type { CartItem } from "@/core/types/commerce";
import { completeBookingPayment, completeStorePayment } from "@/platform/payments/complete-payment";
import { verifyRazorpaySignature } from "@/platform/payments/razorpay";
import { getTenantRazorpayCredentials } from "@/platform/payments/tenant-gateway";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  paymentMethod: z.enum(["upi", "card"]).optional(),
  pendingOrder: z
    .object({
      businessId: z.string().uuid(),
      orderId: z.string().uuid(),
      items: z.array(
        z.object({
          productId: z.string(),
          name: z.string(),
          price: z.number(),
          qty: z.number(),
        }),
      ),
      total: z.number(),
      customerName: z.string(),
      customerPhone: z.string(),
      customerAddress: z.string(),
    })
    .optional(),
  pendingBooking: z
    .object({
      businessId: z.string().uuid(),
      bookingId: z.string().uuid(),
      packageId: z.string().uuid(),
      packageName: z.string(),
      price: z.number(),
      slotDate: z.string(),
      slotTime: z.string(),
      customerName: z.string(),
      customerPhone: z.string(),
    })
    .optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Missing or invalid payment fields" }, { status: 400 });
  }

  const businessId = body.pendingOrder?.businessId ?? body.pendingBooking?.businessId;
  if (!businessId) {
    return NextResponse.json({ error: "Missing business context" }, { status: 400 });
  }

  const creds = await getTenantRazorpayCredentials(businessId);
  if (!creds) {
    return NextResponse.json({ error: "Shop payment gateway is not connected" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature,
    creds.keySecret,
  );

  if (!valid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  if (body.sessionId && body.pendingOrder) {
    const completed = await completeStorePayment({
      sessionId: body.sessionId,
      pendingOrder: body.pendingOrder as {
        businessId: string;
        orderId: string;
        items: CartItem[];
        total: number;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
      },
      paymentMethod: body.paymentMethod ?? "upi",
    });
    if (!completed.ok) {
      return NextResponse.json({ error: completed.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      verified: true,
      orderId: completed.orderId,
    });
  }

  if (body.sessionId && body.pendingBooking) {
    const completed = await completeBookingPayment({
      sessionId: body.sessionId,
      pendingBooking: body.pendingBooking,
    });
    if (!completed.ok) {
      return NextResponse.json({ error: completed.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      verified: true,
      bookingId: completed.bookingId,
    });
  }

  return NextResponse.json({ success: true, verified: true });
}
