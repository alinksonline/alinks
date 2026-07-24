"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  resendEmailOtpAction,
  resendOtpAction,
  sendEmailOtpAction,
  sendOtpAction,
  verifyEmailOtpAction,
  verifyOtpAction,
  verifyWidgetAccessTokenAction,
} from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/platform/google-sign-in-button";
import { useMsg91OtpWidget } from "@/platform/sms/use-msg91-otp-widget";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { TenDigitPhoneInput } from "@/components/ui/ten-digit-phone-input";
import { cn } from "@/core/utils/cn";
import { isValidEmail } from "@/core/utils/email";
import { tenDigitMobileError } from "@/core/utils/phone";
import type { AuthLoginMode } from "@/platform/auth/auth-mode";
import type { OtpDeliveryMode } from "@/platform/sms/otp-mode";

type LoginFormProps = {
  redirectTo?: string;
  authMode: AuthLoginMode;
  otpMode: OtpDeliveryMode;
  widgetConfig: { widgetId: string; widgetToken: string } | null;
};

const GOOGLE_ERRORS: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_state: "Google sign-in expired — try again.",
  google_failed: "Google sign-in failed — try again.",
  db_missing: "Database not configured on server.",
  session_failed: "Could not create your session — try again.",
};

export function LoginForm({
  redirectTo = "/dashboard",
  authMode,
  otpMode,
  widgetConfig,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = GOOGLE_ERRORS[searchParams.get("error") ?? ""];

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [error, setError] = useState<string | null>(googleError ?? null);
  const [isPending, startTransition] = useTransition();
  const msg91Widget = useMsg91OtpWidget(
    otpMode === "msg91-widget" ? widgetConfig?.widgetId : undefined,
    otpMode === "msg91-widget" ? widgetConfig?.widgetToken : undefined,
  );

  const usesEmail = authMode === "email";
  const usesSms = authMode === "sms";

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (usesEmail) {
      if (!isValidEmail(email)) {
        const msg = "Enter a valid email address";
        setError(msg);
        toast.error(msg);
        return;
      }
    } else {
      const phoneError = tenDigitMobileError(phone);
      if (phoneError) {
        setError(phoneError);
        toast.error(phoneError);
        return;
      }
    }

    startTransition(async () => {
      try {
        if (usesEmail) {
          const result = await sendEmailOtpAction(email);
          if (!result.success) {
            const msg = result.error ?? "Could not send code";
            setError(msg);
            toast.error(msg);
            return;
          }
        } else if (otpMode === "msg91-widget") {
          if (!msg91Widget.ready) {
            const msg = msg91Widget.initError ?? "MSG91 widget is still loading";
            setError(msg);
            toast.error(msg);
            return;
          }
          await msg91Widget.sendOtp(phone);
        } else {
          const result = await sendOtpAction(phone);
          if (!result.success) {
            const msg = result.error ?? "Could not send OTP";
            setError(msg);
            toast.error(msg);
            return;
          }
        }
        setStep("otp");
        toast.success("Code sent", usesEmail ? "Check your email inbox." : "Check your SMS.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not send code";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result =
          usesEmail
            ? await verifyEmailOtpAction(email, otp)
            : otpMode === "msg91-widget"
              ? await verifyWidgetAccessTokenAction(await msg91Widget.verifyOtp(otp), phone)
              : await verifyOtpAction(phone, otp);
        if (!result.success) {
          const msg = result.error ?? "Login failed";
          setError(msg);
          toast.error(msg);
          return;
        }
        toast.success("Signed in");
        router.push(result.role === "superadmin" ? "/superadmin" : redirectTo);
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Login failed";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  const mask = usesEmail
    ? email.replace(/^(.{2}).*(@.*)$/, "$1•••$2")
    : `••••${phone.slice(-4)}`;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["identifier", "otp"] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              step === s ? "bg-brand-purple/12 text-brand-purple" : "bg-brand-mist text-brand-ink/40",
            )}
          >
            {s === "identifier" ? (usesEmail ? "1 · Email" : "1 · Mobile") : "2 · Code"}
          </span>
        ))}
      </div>

      <div className="mb-5 space-y-3">
        <GoogleSignInButton />
        {(usesEmail || usesSms) && (
          <p className="text-center text-xs text-brand-ink/45">or continue with {usesEmail ? "email code" : "SMS"}</p>
        )}
      </div>

      {step === "identifier" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          {usesEmail ? (
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="premium-input"
                autoComplete="email"
                required
              />
              <p className="mt-1.5 text-xs text-brand-ink/45">We&apos;ll email you a 6-digit sign-in code (free via Resend).</p>
            </div>
          ) : (
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
          )}
          {otpMode === "msg91-widget" && msg91Widget.initError && (
            <p className="text-xs text-amber-700">{msg91Widget.initError}</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button
            type="submit"
            variant="bronze"
            disabled={isPending || (otpMode === "msg91-widget" && usesSms && !msg91Widget.ready)}
          >
            {isPending ? "Sending…" : usesEmail ? "Email me a code" : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="rounded-xl border border-brand-turquoise/25 bg-brand-turquoise/5 px-4 py-3 text-sm">
            <p className="font-semibold text-brand-ink">Code sent to {mask}</p>
            <p className="mt-1 text-xs text-brand-ink/55">
              {usesEmail
                ? process.env.NODE_ENV === "development"
                  ? "Check inbox/spam, or on localhost enter DEV_OTP from .env if the email doesn’t arrive (Resend free tier only delivers to your Resend account email)."
                  : "Check your inbox and spam folder. Code expires in 10 minutes."
                : authMode === "dev"
                  ? "Dev mode: use DEV_OTP from your .env"
                  : "Enter the code from your SMS."}
            </p>
          </div>
          <div>
            <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Sign-in code
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
                    if (usesEmail) {
                      const r = await resendEmailOtpAction(email);
                      if (!r.success) setError(r.error ?? "Resend failed");
                    } else if (otpMode === "msg91-widget") {
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
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("identifier");
                setOtp("");
                setError(null);
              }}
              className="flex-1 text-xs font-medium text-brand-ink/50"
            >
              ← {usesEmail ? "Change email" : "Change number"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}