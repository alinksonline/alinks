"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/core/types/commerce";
import { completeDevPaymentAction, createCheckoutSessionAction } from "@/app/actions/commerce";

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

          setMessage("Razorpay checkout would open here in production.");
        });
      }}
    >
      <div className="rounded-lg border bg-white p-4 text-sm">
        {items.map((i) => (
          <p key={i.productId}>
            {i.name} × {i.qty} — ₹{i.price * i.qty}
          </p>
        ))}
        <p className="mt-2 font-bold">Total: ₹{total}</p>
      </div>

      <input className="w-full rounded-lg border px-3 py-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />

      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} />
          UPI {devMode && "(simulated)"}
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

      <button type="submit" disabled={isPending || items.length === 0} className="w-full rounded-lg bg-emerald-600 py-3 font-bold text-white disabled:opacity-50">
        {isPending ? "Processing…" : method === "cod" ? "Place COD order" : `Pay ₹${total}`}
      </button>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </form>
  );
}