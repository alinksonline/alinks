import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getGoogleCalendarStatus } from "@/platform/integrations/google-calendar";
import { GoogleCalendarForm } from "./google-calendar-form";

/**
 * Google Calendar Connect — FREE for applicable industries.
 * Not a paid module SKU.
 */
export default async function GoogleIntegrationsPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const status = await getGoogleCalendarStatus(business.id);

  return (
    <PageShell className="py-6 pb-10">
      <p className="premium-label">Integrations</p>
      <h1 className="premium-heading mt-1 text-lg">Google Calendar</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Free for every business with appointments. Connect your Gmail so confirmed bookings can sync to
        your calendar. ALINKS never charges for this capability.
      </p>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
        <strong>Free</strong> — not a Select modules add-on. Platform OAuth app + your Gmail (when live).
      </div>

      <GoogleCalendarForm
        businessId={business.id}
        connected={status.connected}
        googleEmail={status.googleEmail}
        connectionMode={status.connectionMode}
        lastError={status.lastError}
      />

      <p className="mt-6 text-xs text-brand-muted">
        <Link href="/dashboard/appointments" className="font-semibold text-brand-turquoise">
          ← Appointments
        </Link>
        {" · "}
        Live OAuth with Calendar scopes ships next; stub Connect enables dashboard + push hooks today.
      </p>
    </PageShell>
  );
}
