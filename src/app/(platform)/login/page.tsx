import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { Msg91WidgetCleanup } from "@/components/platform/msg91-widget-cleanup";
import { LoginForm } from "./login-form";
import { getSession } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { getMsg91WidgetPublicConfig, getOtpDeliveryMode } from "@/platform/sms/otp-mode";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "superadmin") redirect("/superadmin");
    const business = await getBusinessForTenant(session.userId);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  const otpMode = getOtpDeliveryMode();
  const widgetConfig = getMsg91WidgetPublicConfig();

  const subtitle =
    otpMode === "msg91-widget"
      ? "MSG91 OTP Widget"
      : otpMode === "msg91-api"
        ? "SMS OTP to your mobile number"
        : "Local dev — SMS not configured";

  return (
    <AuthShell
      mode="login"
      title="Sign in with phone OTP"
      subtitle={subtitle}
      footer={
        <p className="text-sm text-brand-ink/55">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-purple">
            Start trial
          </Link>
        </p>
      }
    >
      <Msg91WidgetCleanup otpMode={otpMode} />
      <LoginForm otpMode={otpMode} widgetConfig={widgetConfig} />
    </AuthShell>
  );
}