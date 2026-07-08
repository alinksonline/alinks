import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/platform/auth-shell";
import { Msg91WidgetCleanup } from "@/components/platform/msg91-widget-cleanup";
import { LoginForm } from "./login-form";
import { authLoginModeLabel, getAuthLoginMode } from "@/platform/auth/auth-mode";
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

  const authMode = getAuthLoginMode();
  const otpMode = getOtpDeliveryMode();
  const widgetConfig = getMsg91WidgetPublicConfig();
  const subtitle = authLoginModeLabel(authMode);

  return (
    <AuthShell
      mode="login"
      title="Sign in to ALINKS"
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
      <Suspense fallback={<p className="text-sm text-brand-ink/50">Loading…</p>}>
        <LoginForm authMode={authMode} otpMode={otpMode} widgetConfig={widgetConfig} />
      </Suspense>
    </AuthShell>
  );
}