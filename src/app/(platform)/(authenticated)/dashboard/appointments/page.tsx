import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { canExposeBooking } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getGoogleCalendarStatus } from "@/platform/integrations/google-calendar";
import { listDashboardAppointments } from "@/tenant/appointments/service";
import { AppointmentsPanel } from "./appointments-panel";

export default async function AppointmentsDashboardPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  const bookingOk = canExposeBooking({
    vertical: business.vertical,
    industryGroup: business.industryGroup,
  });

  if (!bookingOk) {
    return (
      <PageShell className="py-8">
        <h1 className="premium-heading text-lg">Appointments</h1>
        <p className="premium-subtext mt-2">
          Booking is not enabled for this industry (e.g. Presence profiles). Switch industry to salon or
          bookings to accept appointments.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-brand-turquoise">
          ← Dashboard
        </Link>
      </PageShell>
    );
  }

  const [appointments, gcal] = await Promise.all([
    listDashboardAppointments(business.id),
    getGoogleCalendarStatus(business.id),
  ]);

  return (
    <PageShell className="py-4 pb-10">
      <p className="premium-label">Schedule</p>
      <h1 className="premium-heading mt-1 text-lg">Appointments</h1>
      <p className="premium-subtext mt-1.5 max-w-sm">
        Free and paid bookings. Customer phone lives in your Sheets; this list is your day board.
      </p>

      <div className="mt-4 rounded-xl border border-brand-ink/8 bg-brand-mist/40 px-3 py-2.5 text-xs text-brand-muted">
        Google Calendar:{" "}
        <strong className="text-brand-ink">{gcal.connected ? "Connected (free)" : "Not connected"}</strong>
        {" · "}
        <Link href="/dashboard/integrations/google" className="font-semibold text-brand-turquoise">
          Manage
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Link href="/editor/packages" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Packages
        </Link>
        <Link href="/editor/staff" className="rounded-full bg-brand-mist px-3 py-1 font-semibold">
          Staff
        </Link>
        <Link
          href={`/${business.handle}/book`}
          className="rounded-full bg-brand-mist px-3 py-1 font-semibold"
          target="_blank"
        >
          Public book page ↗
        </Link>
      </div>

      <AppointmentsPanel businessId={business.id} appointments={appointments} />
    </PageShell>
  );
}
