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
export default async function GoogleIntegrationsPage({
  searchParams,
}: {
  searchParams?: { gcal?: string; gcal_error?: string };
}) {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const status = await getGoogleCalendarStatus(business.id);

  const errMap: Record<string, string> = {
    denied: "Google access was denied.",
    missing: "Missing OAuth code.",
    state: "OAuth state expired — try Connect again.",
    auth: "Sign in required.",
    ownership: "You do not own this business.",
    token: "Could not exchange Google token.",
    save: "Connected, but could not save refresh token (try revoking ALINKS in Google Account and reconnect).",
  };

  return (
    <PageShell className="py-6 pb-10">
      <p className="premium-label">Integrations</p>
      <h1 className="premium-heading mt-1 text-lg">Google Calendar</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Free for every business with appointments. Connect your Gmail so confirmed bookings create
        calendar events and busy times on your Google Calendar block public slots. ALINKS never
        charges for this capability.
      </p>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
        <strong>Free</strong> — not a Select modules add-on. Live OAuth: create events + FreeBusy
        (customer names stay in your data sheet, not on the Google event).
      </div>

      {searchParams?.gcal === "connected" ? (
        <p className="mt-3 text-sm text-emerald-800">Google Calendar connected successfully.</p>
      ) : null}
      {searchParams?.gcal_error ? (
        <p className="mt-3 text-sm text-red-600">
          {errMap[searchParams.gcal_error] ?? "Could not connect Google Calendar."}
        </p>
      ) : null}

      <GoogleCalendarForm
        businessId={business.id}
        connected={status.connected}
        googleEmail={status.googleEmail}
        connectionMode={status.connectionMode}
        lastError={status.lastError}
        oauthConfigured={status.oauthConfigured}
      />

      <p className="mt-6 text-xs text-brand-muted">
        <Link href="/dashboard/appointments" className="font-semibold text-brand-turquoise">
          ← Appointments
        </Link>
        {" · "}
        Redirect URI to allow in Google Cloud:{" "}
        <code className="text-[10px]">/api/integrations/google-calendar/callback</code>
      </p>
    </PageShell>
  );
}
