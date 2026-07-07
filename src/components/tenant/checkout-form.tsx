"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/core/types/commerce";
import { completeDevPaymentAction, createCheckoutSessionAction } from "@/app/actions/commerce";
import { openRazorpayCheckout, verifyPaymentViaApi } from "@/lib/razorpay-checkout";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

export function CheckoutForm({
  handle,
  items,
  codEnabled,
  devMode,
}: {
  handle: string;
  items: CartItem[];
  codEnabled: boolean;
  devMode: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<"upi" | "card" | "cod">("upi");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await createCheckoutSessionAction({
            handle,
            items,
            paymentMethod: method,
            customerName: name,
            customerPhone: phone,
            customerAddress: address,
            acceptCheckoutTerms: acceptTerms,
          });

          if (!result.success) {
            setMessage(result.error);
            return;
          }

          if (result.paymentMethod === "cod") {
            setMessage(`Order placed! COD order ${result.orderId}`);
            router.push(`/${handle}/store`);
            return;
          }

          if (result.devMode && result.pendingOrder && result.sessionId) {
            const paid = await completeDevPaymentAction({
              sessionId: result.sessionId,
              pendingOrder: result.pendingOrder,
              paymentMethod: method === "card" ? "card" : "upi",
            });
            if (paid.success) {
              setMessage(`Payment successful! Order ${paid.orderId} saved to your sheet.`);
              router.push(`/${handle}/store`);
            } else {
              setMessage(paid.error);
            }
            return;
          }

          if (!RAZORPAY_KEY_ID) {
            setMessage("Payment gateway is not configured on the client.");
            return;
          }

          if (!result.razorpayOrderId || !result.sessionId || !result.pendingOrder) {
            setMessage("Could not start payment. Try again.");
            return;
          }

          try {
            await openRazorpayCheckout({
              keyId: RAZORPAY_KEY_ID,
              orderId: result.razorpayOrderId,
              amountPaise: result.amountPaise,
              name: result.businessName ?? "ALINKS Store",
              description: `Order ${result.orderId}`,
              prefill: { name, contact: phone },
              onDismiss: () => setMessage("Payment cancelled."),
              onFailure: (err) => setMessage(err),
              onSuccess: async (payment) => {
                const verified = await verifyPaymentViaApi({
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature,
                  sessionId: result.sessionId,
                  paymentMethod: method === "card" ? "card" : "upi",
                  pendingOrder: result.pendingOrder,
                });

                if (!verified.success) {
                  setMessage(verified.error ?? "Payment verification failed");
                  return;
                }

                setMessage(`Payment successful! Order ${verified.orderId ?? result.orderId} saved.`);
                router.push(`/${handle}/store`);
              },
            });
          } catch (err) {
            setMessage(err instanceof Error ? err.message : "Could not open payment");
          }
        });
      }}
    >
      <div className="premium-card-soft p-4 text-sm">
        {items.map((i) => (
          <p key={i.productId}>
            {i.name} × {i.qty} — ₹{i.price * i.qty}
          </p>
        ))}
        <p className="mt-2 font-bold">Total: ₹{total}</p>
      </div>

      <input className="premium-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="premium-input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input className="premium-input" placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />

      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} />
          UPI / GPay / PhonePe {devMode && "(simulated)"}
        </label>
        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
          Card
        </label>
        {codEnabled && (
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
            Cash on delivery
          </label>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
        I agree to the store checkout terms and privacy notice.
      </label>

      <button type="submit" disabled={isPending || items.length === 0} className="premium-btn-bronze disabled:opacity-50">
        {isPending ? "Processing…" : method === "cod" ? "Place COD order" : `Pay ₹${total}`}
      </button>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </form>
  );
}