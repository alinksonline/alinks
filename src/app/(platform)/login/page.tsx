import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/platform/auth-shell";
import { LoginForm } from "./login-form";
import { getSession } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "superadmin") redirect("/superadmin");
    const business = await getBusinessForTenant(session.userId);
    redirect(business ? "/dashboard" : "/onboarding");
  }

  const devOtp = process.env.DEV_OTP ?? "1111";

  return (
    <AuthShell
      mode="login"
      title="Sign in with phone OTP"
      subtitle={`phase_0 · dev OTP ${devOtp}`}
      footer={
        <p className="font-mono text-xs text-zinc-500">
          New here?{" "}
          <Link href="/signup" className="text-tech-cyan transition hover:text-white">
            Start trial →
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}