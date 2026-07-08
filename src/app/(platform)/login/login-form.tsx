"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendOtpAction, sendOtpAction, verifyOtpAction, verifyWidgetAccessTokenAction } from "@/app/actions/auth";
import { useMsg91OtpWidget } from "@/platform/sms/use-msg91-otp-widget";
import { Button } from "@/components/ui/button";
import { TenDigitPhoneInput } from "@/components/ui/ten-digit-phone-input";
import { cn } from "@/core/utils/cn";
import { tenDigitMobileError } from "@/core/utils/phone";
import type { OtpDeliveryMode } from "@/platform/sms/otp-mode";

type LoginFormProps = {
  redirectTo?: string;
  otpMode: OtpDeliveryMode;
  widgetConfig: { widgetId: string; widgetToken: string } | null;
};

export function LoginForm({ redirectTo = "/dashboard", otpMode, widgetConfig }: LoginFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const msg91Widget = useMsg91OtpWidget(
    otpMode === "msg91-widget" ? widgetConfig?.widgetId : undefined,
    otpMode === "msg91-widget" ? widgetConfig?.widgetToken : undefined,
  );

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phoneError = tenDigitMobileError(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    startTransition(async () => {
      try {
        if (otpMode === "msg91-widget") {
          if (!msg91Widget.ready) {
            setError(msg91Widget.initError ?? "MSG91 widget is still loading — wait a moment and try again");
            return;
          }
          await msg91Widget.sendOtp(phone);
        } else {
          const result = await sendOtpAction(phone);
          if (!result.success) {
            setError(result.error ?? "Could not send OTP");
            return;
          }
        }
        setStep("otp");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not send OTP");
      }
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result =
          otpMode === "msg91-widget"
            ? await verifyWidgetAccessTokenAction(await msg91Widget.verifyOtp(otp), phone)
            : await verifyOtpAction(phone, otp);
        if (!result.success) {
          setError(result.error ?? "Login failed");
          return;
        }
        router.push(result.role === "superadmin" ? "/superadmin" : redirectTo);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Login failed");
      }
    });
  };

  const last4 = phone.slice(-4);
  const usesMsg91 = otpMode === "msg91-widget" || otpMode === "msg91-api";

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["phone", "otp"] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              step === s ? "bg-brand-purple/12 text-brand-purple" : "bg-brand-mist text-brand-ink/40",
            )}
          >
            {s === "phone" ? "1 · Mobile" : "2 · OTP"}
          </span>
        ))}
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Mobile / WhatsApp number
            </label>
            <TenDigitPhoneInput
              id="phone"
              value={phone}
              onValueChange={setPhone}
              placeholder="9160425142"
              required
            />
            <p className="mt-1.5 text-xs text-brand-ink/45">Exactly 10 digits only — e.g. 9160425142</p>
          </div>
          {otpMode === "msg91-widget" && msg91Widget.initError && (
            <p className="text-xs text-amber-700">{msg91Widget.initError}</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="bronze" disabled={isPending || (otpMode === "msg91-widget" && !msg91Widget.ready)}>
            {isPending ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="rounded-xl border border-brand-turquoise/25 bg-brand-turquoise/5 px-4 py-3 text-sm">
            {usesMsg91 ? (
              <>
                <p className="font-semibold text-brand-ink">OTP sent to ••••{last4}</p>
                <p className="mt-1 text-xs text-brand-ink/55">Enter the code from your SMS — not a demo OTP.</p>
              </>
            ) : (
              <p className="text-xs text-brand-ink/55">
                Dev mode: use <code className="rounded bg-brand-mist px-1">DEV_OTP</code> from your local{" "}
                <code className="rounded bg-brand-mist px-1">.env</code>
              </p>
            )}
          </div>
          <div>
            <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              OTP code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="····"
              className="premium-input text-center text-2xl tracking-[0.4em]"
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="bronze" disabled={isPending}>
            {isPending ? "Verifying…" : "Continue"}
          </Button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  try {
                    if (otpMode === "msg91-widget") {
                      await msg91Widget.resendOtp();
                    } else {
                      const r = await resendOtpAction(phone);
                      if (!r.success) setError(r.error ?? "Resend failed");
                    }
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Resend failed");
                  }
                })
              }
              disabled={isPending}
              className="flex-1 text-xs font-semibold text-brand-purple"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              className="flex-1 text-xs font-medium text-brand-ink/50"
            >
              ← Change number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}