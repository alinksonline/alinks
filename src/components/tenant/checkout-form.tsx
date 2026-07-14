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
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  function setStatus(text: string, tone: "error" | "success" | "info" = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  return (
    <form
      className="space-y-5"
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
            setStatus(result.error, "error");
            return;
          }

          if (result.paymentMethod === "cod") {
            setStatus(`Order placed! COD order ${result.orderId}`, "success");
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
              setStatus(`Payment successful! Order ${paid.orderId} saved to your sheet.`, "success");
              router.push(`/${handle}/store`);
            } else {
              setStatus(paid.error, "error");
            }
            return;
          }

          if (!RAZORPAY_KEY_ID) {
            setStatus("Payment gateway is not configured on the client.", "error");
            return;
          }

          if (!result.razorpayOrderId || !result.sessionId || !result.pendingOrder) {
            setStatus("Could not start payment. Try again.", "error");
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
              onDismiss: () => setStatus("Payment cancelled.", "info"),
              onFailure: (err) => setStatus(err, "error"),
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
                  setStatus(verified.error ?? "Payment verification failed", "error");
                  return;
                }

                setStatus(`Payment successful! Order ${verified.orderId ?? result.orderId} saved.`, "success");
                router.push(`/${handle}/store`);
              },
            });
          } catch (err) {
            setStatus(err instanceof Error ? err.message : "Could not open payment", "error");
          }
        });
      }}
    >
      <div className="t-card space-y-2 p-4">
        <p className="t-label !mb-2">Order summary</p>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between gap-2 text-sm">
            <span className="t-ink">
              {i.name} × {i.qty}
            </span>
            <span className="t-muted">₹{i.price * i.qty}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[var(--t-border)] pt-2 text-sm font-bold">
          <span className="t-ink">Total</span>
          <span style={{ color: "var(--t-primary)" }}>₹{total}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="t-input-group">
          <label className="t-label" htmlFor="checkout-name">
            Your name
          </label>
          <input
            id="checkout-name"
            className="t-input"
            placeholder="e.g. Rahul"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="t-input-group">
          <label className="t-label" htmlFor="checkout-phone">
            Phone
          </label>
          <input
            id="checkout-phone"
            className="t-input"
            placeholder="10-digit mobile"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
          />
        </div>
        <div className="t-input-group">
          <label className="t-label" htmlFor="checkout-address">
            Address (optional)
          </label>
          <input
            id="checkout-address"
            className="t-input"
            placeholder="Delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="t-label">Payment method</p>
        <div className="mt-2 space-y-2">
          {(
            [
              {
                id: "upi" as const,
                label: "UPI / GPay / PhonePe",
                hint: devMode ? "Simulated in demo" : "Instant",
              },
              { id: "card" as const, label: "Card", hint: "Debit / credit" },
              ...(codEnabled
                ? [{ id: "cod" as const, label: "Cash on delivery", hint: "Pay when you receive" }]
                : []),
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="t-package-card"
              data-selected={method === opt.id ? "true" : "false"}
              onClick={() => setMethod(opt.id)}
              aria-pressed={method === opt.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{opt.label}</span>
                <span className="t-muted text-[10px] font-medium">{opt.hint}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="t-package-card"
        data-selected={acceptTerms ? "true" : "false"}
        onClick={() => setAcceptTerms((v) => !v)}
        aria-pressed={acceptTerms}
      >
        <p className="text-sm font-semibold">I agree to checkout terms & privacy</p>
        <p className="t-muted mt-0.5 text-xs leading-relaxed">
          Required before placing your order.
        </p>
      </button>

      <button type="submit" disabled={isPending || items.length === 0 || !acceptTerms} className="t-btn-primary">
        {isPending ? "Processing…" : method === "cod" ? "Place COD order" : `Pay ₹${total}`}
      </button>

      {message ? (
        <p
          className={
            messageTone === "error"
              ? "t-banner t-banner-error"
              : messageTone === "success"
                ? "t-banner t-banner-success"
                : "t-banner"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
