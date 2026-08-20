"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/core/types/commerce";
import { createCheckoutSessionAction } from "@/app/actions/commerce";
import { openRazorpayCheckout, verifyPaymentViaApi } from "@/lib/razorpay-checkout";
import { cartFulfillmentSummary, cartRequiresAddress } from "@/core/utils/order-fulfillment";
import { saveLocalOrder, stashCheckoutCart } from "@/components/tenant/local-orders";

export function CheckoutForm({
  handle,
  items,
  codEnabled,
  onlinePayEnabled = true,
}: {
  handle: string;
  items: CartItem[];
  codEnabled: boolean;
  /** Shop has connected their own Razorpay */
  onlinePayEnabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<"upi" | "card" | "cod">(
    onlinePayEnabled ? "upi" : codEnabled ? "cod" : "upi",
  );
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");
  const paymentSettled = useRef(false);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fulfillment = cartFulfillmentSummary(items);
  const requiresAddress = cartRequiresAddress(items);

  function setStatus(text: string, tone: "error" | "success" | "info" = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  function persistOrder(orderId: string, method: string, status: string) {
    saveLocalOrder(handle, {
      orderId,
      date: new Date().toISOString(),
      items,
      total,
      method,
      status,
      customerName: name,
      customerPhone: phone,
      customerAddress: requiresAddress ? address : "",
    });
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
            customerAddress: requiresAddress ? address : undefined,
            acceptCheckoutTerms: acceptTerms,
          });

          if (!result.success) {
            setStatus(result.error, "error");
            return;
          }

          if (result.paymentMethod === "cod") {
            persistOrder(result.orderId, "cod", "placed");
            router.push(`/${handle}/checkout/success?orderId=${encodeURIComponent(result.orderId)}`);
            return;
          }

          if (!result.razorpayOrderId || !result.sessionId || !result.pendingOrder || !result.razorpayKeyId) {
            setStatus("Could not start payment. The shop may not have connected Razorpay.", "error");
            return;
          }

          stashCheckoutCart(handle, items);
          paymentSettled.current = false;
          try {
            await openRazorpayCheckout({
              keyId: result.razorpayKeyId,
              orderId: result.razorpayOrderId,
              amountPaise: result.amountPaise,
              name: result.businessName ?? "ALINKS Store",
              description: `Order ${result.orderId}`,
              prefill: { name, contact: phone },
              onDismiss: () => {
                if (paymentSettled.current) return;
                paymentSettled.current = true;
                persistOrder(result.orderId, method, "declined");
                router.push(
                  `/${handle}/checkout/declined?reason=cancelled&orderId=${encodeURIComponent(result.orderId)}`,
                );
              },
              onFailure: (err) => {
                if (paymentSettled.current) return;
                paymentSettled.current = true;
                persistOrder(result.orderId, method, "declined");
                router.push(
                  `/${handle}/checkout/declined?reason=failed&orderId=${encodeURIComponent(result.orderId)}&msg=${encodeURIComponent(err)}`,
                );
              },
              onSuccess: async (payment) => {
                paymentSettled.current = true;
                const verified = await verifyPaymentViaApi({
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature,
                  sessionId: result.sessionId,
                  paymentMethod: method === "card" ? "card" : "upi",
                  pendingOrder: result.pendingOrder,
                });

                if (!verified.success) {
                  persistOrder(result.orderId, method, "declined");
                  router.push(
                    `/${handle}/checkout/declined?reason=failed&orderId=${encodeURIComponent(result.orderId)}&msg=${encodeURIComponent(verified.error ?? "Payment declined")}`,
                  );
                  return;
                }

                persistOrder(verified.orderId ?? result.orderId, method, "placed");
                router.push(
                  `/${handle}/checkout/success?orderId=${encodeURIComponent(verified.orderId ?? result.orderId)}`,
                );
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
              <span className="t-muted mt-0.5 block text-[10px] font-medium uppercase tracking-wide">
                {i.productType === "service"
                  ? i.deliveryMode === "doorstep"
                    ? "Doorstep service"
                    : "At the shop"
                  : "Physical item"}
              </span>
            </span>
            <span className="t-muted">₹{i.price * i.qty}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[var(--t-border)] pt-2 text-sm font-bold">
          <span className="t-ink">Total</span>
          <span style={{ color: "var(--t-primary-text, var(--t-primary))" }}>₹{total}</span>
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
        {requiresAddress ? (
          <div className="t-input-group">
            <label className="t-label" htmlFor="checkout-address">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="checkout-address"
              className="t-input min-h-[4.5rem]"
              placeholder="House / street / area / pincode"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <p className="t-muted mt-1 text-[11px] leading-relaxed">
              Needed because this order includes
              {fulfillment.physicalCount ? " a physical item" : ""}
              {fulfillment.physicalCount && fulfillment.doorstepServiceCount ? " or" : ""}
              {fulfillment.doorstepServiceCount ? " a doorstep service" : ""}.
            </p>
          </div>
        ) : (
          <p className="t-muted text-[11px] leading-relaxed">
            This is a service at the shop — no delivery address needed.
          </p>
        )}
      </div>

      <div>
        <p className="t-label">Payment method</p>
        <div className="mt-2 space-y-2">
          {(
            [
              ...(onlinePayEnabled
                ? ([
                    {
                      id: "upi" as const,
                      label: "UPI / GPay / PhonePe",
                      hint: "Via shop's Razorpay",
                    },
                    { id: "card" as const, label: "Card", hint: "Debit / credit" },
                  ] as const)
                : []),
              ...(codEnabled
                ? ([{ id: "cod" as const, label: "Cash on delivery", hint: "Pay when you receive" }] as const)
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
