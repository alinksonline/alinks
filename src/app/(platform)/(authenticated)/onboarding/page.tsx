import { redirect } from "next/navigation";
import { requireAuth } from "@/platform/auth/session";
import { getBusinessForTenant } from "@/platform/business/require-business";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await requireAuth();
  const business = await getBusinessForTenant(session.userId);
  if (business) redirect("/dashboard");

  return (
    <main className="app-container py-10 pb-tab-safe">
      <p className="premium-label">Onboarding</p>
      <h1 className="premium-heading mt-2">Set up your business</h1>
      <p className="premium-subtext mt-2">14-day Pro trial · 5-page mini-site</p>
      <div className="premium-card mt-8 shadow-soft">
        <div className="px-5 py-6">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}