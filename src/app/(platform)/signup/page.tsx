import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { Msg91WidgetCleanup } from "@/components/platform/msg91-widget-cleanup";
import { SignupForm } from "@/components/platform/signup-form";
import { getSession } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { getMsg91WidgetPublicConfig, getOtpDeliveryMode } from "@/platform/sms/otp-mode";

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    const business = await getBusinessForTenant(session.userId);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  const otpMode = getOtpDeliveryMode();
  const widgetConfig = getMsg91WidgetPublicConfig();

  const subtitle =
    otpMode === "msg91-widget"
      ? "Verify your mobile · MSG91 OTP Widget"
      : otpMode === "msg91-api"
        ? "Verify your mobile number · SMS OTP via MSG91"
        : "Local dev — configure MSG91 in .env for real SMS";

  return (
    <AuthShell
      mode="signup"
      title="Create your ALINKS business site"
      subtitle={subtitle}
      footer={
        <p className="text-sm text-brand-ink/55">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-purple">
            Sign in
          </Link>
        </p>
      }
    >
      <Msg91WidgetCleanup otpMode={otpMode} />
      <SignupForm otpMode={otpMode} widgetConfig={widgetConfig} />
    </AuthShell>
  );
}