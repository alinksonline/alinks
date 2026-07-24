"use client";

import { useMemo, useState, useTransition } from "react";
import { LegalAgreementField } from "@/components/legal/legal-agreement-field";
import { useRouter } from "next/navigation";
import { completeSignupAction } from "@/app/actions/signup";
import {
  resendEmailOtpAction,
  resendOtpAction,
  sendEmailOtpAction,
  sendOtpAction,
} from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/platform/google-sign-in-button";
import { useMsg91OtpWidget } from "@/platform/sms/use-msg91-otp-widget";
import { Button } from "@/components/ui/button";
import type { AuthLoginMode } from "@/platform/auth/auth-mode";
import type { OtpDeliveryMode } from "@/platform/sms/otp-mode";
import type { SiteTemplateId } from "@/core/types/page";
import { isValidEmail } from "@/core/utils/email";
import { isValidHandle, normalizeHandle } from "@/core/utils/slug";
import { TenDigitPhoneInput } from "@/components/ui/ten-digit-phone-input";
import { cn } from "@/core/utils/cn";
import { tenDigitMobileError } from "@/core/utils/phone";

const VERTICALS: { id: string; label: string; note?: string }[] = [
  {
    id: "presence",
    label: "Presence / influencer / profile",
    note: "Link hub & collabs — no selling on ALINKS",
  },
  { id: "salon", label: "Salon & beauty" },
  { id: "kirana", label: "Kirana / grocery shop" },
  { id: "ecommerce", label: "Retail / ecommerce" },
  { id: "clinic", label: "Clinic / doctor (license required to publish)" },
  { id: "pharmacy", label: "Pharmacy (Phase 2 — license required)" },
  {
    id: "restaurant",
    label: "Restaurant / food / cloud kitchen",
    note: "Menu + WhatsApp · cloud types never get table QR",
  },
  { id: "general", label: "Other local business" },
];

type SignupFormProps = {
  authMode: AuthLoginMode;
  otpMode: OtpDeliveryMode;
  widgetConfig: { widgetId: string; widgetToken: string } | null;
};

export function SignupForm({ authMode, otpMode, widgetConfig }: SignupFormProps) {
  const usesEmail = authMode === "email";
  const router = useRouter();
  const [step, setStep] = useState<"business" | "otp">("business");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [handle, setHandle] = useState("");
  const [vertical, setVertical] = useState("presence");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [otp, setOtp] = useState("");
  const [acceptTos, setAcceptTos] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptAup, setAcceptAup] = useState(false);
  const [acceptResponsibility, setAcceptResponsibility] = useState(false);
  const [acceptNoHarmfulUse, setAcceptNoHarmfulUse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const msg91Widget = useMsg91OtpWidget(
    otpMode === "msg91-widget" ? widgetConfig?.widgetId : undefined,
    otpMode === "msg91-widget" ? widgetConfig?.widgetToken : undefined,
  );

  const suggestedHandle = useMemo(
    () => normalizeHandle(handle || businessName),
    [handle, businessName],
  );

  const legalOk =
    acceptTos && acceptPrivacy && acceptAup && acceptResponsibility && acceptNoHarmfulUse;

  const sendOtp = () => {
    setError(null);
    if (!usesEmail) {
      const phoneError = tenDigitMobileError(phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }
    if (!businessName.trim()) {
      setError("Enter your business name");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!isValidHandle(suggestedHandle)) {
      setError("Choose a valid site handle (letters, numbers, hyphens only)");
      return;
    }
    if (!legalOk) {
      setError("Accept all declarations to continue");
      return;
    }
    if (businessPurpose.trim().length < 10) {
      setError("Describe what your business does (helps us prevent misuse)");
      return;
    }

    startTransition(async () => {
      try {
        if (usesEmail) {
          const result = await sendEmailOtpAction(email);
          if (!result.success) {
            setError(result.error ?? "Could not send code");
            return;
          }
        } else if (otpMode === "msg91-widget") {
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

  const resendOtp = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (usesEmail) {
          const result = await resendEmailOtpAction(email);
          if (!result.success) {
            setError(result.error ?? "Could not resend code");
            return;
          }
        } else if (otpMode === "msg91-widget") {
          await msg91Widget.resendOtp();
        } else {
          const result = await resendOtpAction(phone);
          if (!result.success) {
            setError(result.error ?? "Could not resend OTP");
            return;
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not resend OTP");
      }
    });
  };

  const completeSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        let msg91AccessToken: string | undefined;
        if (otpMode === "msg91-widget") {
          msg91AccessToken = await msg91Widget.verifyOtp(otp);
        }

        const result = await completeSignupAction({
          authMode,
          phone: usesEmail ? undefined : phone,
          email: email.trim(),
          otp: otpMode === "msg91-widget" ? undefined : otp,
          msg91AccessToken,
          businessName: businessName.trim(),
          handle: suggestedHandle,
          vertical,
          businessPurpose: businessPurpose.trim(),
          templateId: (vertical === "presence"
            ? "presence"
            : vertical === "salon"
              ? "salon"
              : vertical === "kirana" || vertical === "ecommerce"
                ? "ecommerce"
                : "general") as SiteTemplateId,
          acceptTos,
          acceptPrivacy,
          acceptAup,
          acceptResponsibility,
          acceptNoHarmfulUse,
        });
        if (!result.success) {
          setError(result.error ?? "Signup failed");
          return;
        }
        // Signup is only for platform clients (tenants) — never superadmin.
        router.push("/editor");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Signup failed");
      }
    });
  };

  const codeHint = usesEmail
    ? email.replace(/^(.{2}).*(@.*)$/, "$1•••$2")
    : `••••${phone.slice(-4)}`;

  return (
    <div>
      <div className="mb-5 space-y-3">
        <GoogleSignInButton label="Sign up with Google" />
        <p className="text-center text-xs text-brand-ink/45">or verify with {usesEmail ? "email code" : "mobile OTP"}</p>
      </div>

      <div className="mb-6 flex gap-2">
        {(["business", "otp"] as const).map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
              step === s ? "bg-brand-purple/12 text-brand-purple" : "bg-brand-mist text-brand-ink/40",
            )}
          >
            {s === "business" ? "1 · Your business" : usesEmail ? "2 · Verify email" : "2 · Verify mobile"}
          </span>
        ))}
      </div>

      {step === "business" ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="businessName" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Business name
            </label>
            <input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Priya Beauty Salon"
              className="premium-input"
              required
            />
          </div>

          <div>
            <label htmlFor="handle" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Handle — your public site URL
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-brand-ink/10 bg-brand-surface px-3 py-2">
              <span className="shrink-0 text-sm text-brand-ink/40">alinks.online/</span>
              <input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={suggestedHandle || "priya-salon"}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-brand-ink/45">
              <strong>Handle ≠ login.</strong> This is your public site address (e.g.{" "}
              <span className="font-mono">priya-salon</span>). You sign in with{" "}
              {usesEmail ? "your email + code" : "your mobile number + OTP"}.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="premium-input"
              autoComplete="email"
              required
            />
            <p className="mt-1.5 text-xs text-brand-ink/45">
              {usesEmail
                ? "We email you a 6-digit sign-in code. Use this address every time you log in."
                : "Account contact & billing notices. Sign in with your mobile number + SMS code."}
            </p>
          </div>

          {!usesEmail && (
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
              <p className="mt-1.5 text-xs text-brand-ink/45">
                Exactly 10 digits — e.g. <span className="font-mono">9160425142</span>
              </p>
            </div>
          )}

          <div>
            <label htmlFor="vertical" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              Business type
            </label>
            <select
              id="vertical"
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="premium-input"
            >
              {VERTICALS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="purpose" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              What will you use ALINKS for?
            </label>
            <textarea
              id="purpose"
              value={businessPurpose}
              onChange={(e) => setBusinessPurpose(e.target.value)}
              rows={3}
              placeholder="e.g. Salon bookings, package sales, and sharing offers on WhatsApp"
              className="premium-input resize-none"
            />
            <p className="mt-1.5 text-xs text-brand-ink/45">
              Required for compliance. Illegal, fraudulent, or harmful use is prohibited.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-brand-ink/8 bg-brand-mist/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/45">Legal agreements</p>
            <LegalAgreementField docId="tos" checked={acceptTos} onChange={setAcceptTos} />
            <LegalAgreementField docId="privacy" checked={acceptPrivacy} onChange={setAcceptPrivacy} />
            <LegalAgreementField docId="aup" checked={acceptAup} onChange={setAcceptAup} />
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptResponsibility} onChange={(e) => setAcceptResponsibility(e.target.checked)} className="mt-0.5" />
              <span>I am solely responsible for my business, licences, products, and services — not Artix</span>
            </label>
            <label className="flex gap-2">
              <input type="checkbox" checked={acceptNoHarmfulUse} onChange={(e) => setAcceptNoHarmfulUse(e.target.checked)} className="mt-0.5" />
              <span>I will not use ALINKS for illegal, fraudulent, hateful, or harmful activities</span>
            </label>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          {otpMode === "msg91-widget" && msg91Widget.initError && (
            <p className="text-xs text-amber-700">{msg91Widget.initError}</p>
          )}
          <Button
            type="button"
            variant="bronze"
            disabled={isPending || (otpMode === "msg91-widget" && !msg91Widget.ready)}
            onClick={sendOtp}
          >
            {isPending ? "Sending…" : usesEmail ? "Email me a verification code" : "Send OTP to verify number"}
          </Button>
        </div>
      ) : (
        <form onSubmit={completeSignup} className="space-y-5">
          <div className="rounded-xl border border-brand-turquoise/25 bg-brand-turquoise/5 px-4 py-3 text-sm text-brand-ink/80">
            {usesEmail ? (
              <>
                <p className="font-semibold text-brand-ink">Check email at {codeHint}</p>
                <p className="mt-1 text-xs text-brand-ink/55">
                  {process.env.NODE_ENV === "development"
                    ? "6-digit code via Resend, or use DEV_OTP from .env on localhost if the email never arrives (Resend free tier often only reaches your Resend account email)."
                    : "6-digit code via Resend. Check spam if needed. Expires in 10 minutes."}
                </p>
              </>
            ) : otpMode === "msg91-widget" || otpMode === "msg91-api" ? (
              <>
                <p className="font-semibold text-brand-ink">Check SMS on {codeHint}</p>
                <p className="mt-1 text-xs text-brand-ink/55">
                  OTP sent via MSG91{otpMode === "msg91-widget" ? " Widget" : ""}. Wait 60 seconds, then tap Resend if needed.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-brand-ink">Local dev mode — SMS not configured</p>
                <p className="mt-1 text-xs text-brand-ink/55">
                  Use the OTP from <code className="rounded bg-brand-mist px-1">DEV_OTP</code> in your{" "}
                  <code className="rounded bg-brand-mist px-1">.env</code> file (not shown here for security).
                </p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              {usesEmail ? "Sign-in code" : "OTP from SMS"}
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
            {isPending ? "Creating your site…" : "Verify & create my ALINKS site"}
          </Button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resendOtp}
              disabled={isPending}
              className="flex-1 text-xs font-semibold text-brand-purple"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("business");
                setOtp("");
                setError(null);
              }}
              className="flex-1 text-xs font-medium text-brand-ink/50"
            >
              ← Edit details
            </button>
          </div>
        </form>
      )}
    </div>
  );
}