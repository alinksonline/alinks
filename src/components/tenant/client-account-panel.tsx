"use client";

import { useState, useTransition } from "react";
import {
  logoutShopClientAction,
  requestShopClientOtpAction,
  verifyShopClientOtpAction,
} from "@/app/actions/client-auth";
import { OrderHistory } from "@/components/tenant/order-history";

export function ClientAccountPanel({
  handle,
  businessPhone,
  allowCancel,
  allowModify,
  sessionPhone,
}: {
  handle: string;
  businessPhone: string;
  allowCancel: boolean;
  allowModify: boolean;
  sessionPhone: string | null;
}) {
  const [phone, setPhone] = useState(sessionPhone ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">(sessionPhone ? "phone" : "phone");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const loggedIn = Boolean(sessionPhone);

  if (loggedIn && sessionPhone) {
    return (
      <div className="space-y-4">
        <div className="t-card flex items-center justify-between gap-2 p-4">
          <div>
            <p className="t-ink text-sm font-semibold">Signed in</p>
            <p className="t-muted text-xs">This shop only · {sessionPhone}</p>
          </div>
          <button
            type="button"
            className="t-link text-xs font-semibold"
            onClick={() =>
              startTransition(async () => {
                await logoutShopClientAction();
                window.location.reload();
              })
            }
          >
            Log out
          </button>
        </div>
        <OrderHistory
          handle={handle}
          businessPhone={businessPhone}
          allowCancel={allowCancel}
          allowModify={allowModify}
          lockedPhone={sessionPhone}
        />
      </div>
    );
  }

  return (
    <div className="t-card space-y-3 p-4">
      <p className="t-ink text-sm font-semibold">Client login</p>
      <p className="t-muted text-xs leading-relaxed">
        This is your account with <strong>this shop</strong>, not ALINKS. Use the mobile number from checkout.
      </p>
      <input
        className="t-input"
        inputMode="numeric"
        placeholder="10-digit mobile"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
      />
      {sent ? (
        <input
          className="t-input"
          inputMode="numeric"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      ) : null}
      <button
        type="button"
        className="t-btn-primary"
        disabled={isPending || phone.length !== 10}
        onClick={() =>
          startTransition(async () => {
            if (!sent) {
              const r = await requestShopClientOtpAction(handle, phone);
              if (!r.success) {
                setMessage(r.error);
                return;
              }
              setSent(true);
              setStep("code");
              setMessage(r.delivery === "dev" ? "Dev mode: use DEV_OTP from .env" : "Code sent by SMS.");
              return;
            }
            const r = await verifyShopClientOtpAction(handle, phone, code);
            if (!r.success) {
              setMessage(r.error);
              return;
            }
            window.location.reload();
          })
        }
      >
        {sent ? "Verify and open my orders" : "Send login code"}
      </button>
      {message ? <p className="t-muted text-xs">{message}</p> : null}
      {step === "code" ? null : null}
    </div>
  );
}
