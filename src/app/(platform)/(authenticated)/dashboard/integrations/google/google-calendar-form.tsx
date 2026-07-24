"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  connectGoogleCalendarStubAction,
  disconnectGoogleCalendarAction,
} from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";

const linkBtnClass =
  "premium-btn-primary inline-flex items-center justify-center no-underline disabled:opacity-45";

export function GoogleCalendarForm({
  businessId,
  connected,
  googleEmail,
  connectionMode,
  lastError,
  oauthConfigured,
}: {
  businessId: string;
  connected: boolean;
  googleEmail: string | null;
  connectionMode: string;
  lastError: string | null;
  oauthConfigured: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(googleEmail ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const startHref = `/api/integrations/google-calendar/start?businessId=${encodeURIComponent(businessId)}`;

  return (
    <div className="premium-card mt-5 space-y-4 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-brand-ink">
          Status: {connected ? "Connected" : "Not connected"}
        </p>
        {connected && googleEmail ? (
          <p className="mt-1 text-xs text-brand-muted">{googleEmail}</p>
        ) : null}
        {connectionMode === "oauth" && connected ? (
          <p className="mt-1 text-xs text-emerald-800">
            Live Google Calendar — new bookings push events to this Gmail calendar (free).
          </p>
        ) : null}
        {connectionMode === "stub" && connected ? (
          <p className="mt-1 text-xs text-amber-800">
            Demo / stub mode — event ids are recorded without calling Google. Use Connect with Google
            for live sync.
          </p>
        ) : null}
        {lastError ? <p className="mt-1 text-xs text-red-600">{lastError}</p> : null}
      </div>

      {!connected ? (
        <div className="space-y-3">
          {oauthConfigured ? (
            <a href={startHref} className={linkBtnClass}>
              Connect with Google (live calendar — free)
            </a>
          ) : (
            <p className="text-xs text-brand-muted">
              Live Google OAuth is not configured on this environment. Set{" "}
              <code className="text-[10px]">GOOGLE_CLIENT_ID</code> and{" "}
              <code className="text-[10px]">GOOGLE_CLIENT_SECRET</code>, and add redirect URI{" "}
              <code className="text-[10px]">/api/integrations/google-calendar/callback</code> in
              Google Cloud Console.
            </p>
          )}

          {/* Stub only outside production — never market as live sync */}
          {process.env.NODE_ENV !== "production" ? (
            <div className="border-t border-brand-border pt-3">
              <label className="mb-1 block text-xs font-medium text-brand-muted">
                Stub email note (dev only — not live Google)
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                className="mt-2"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await connectGoogleCalendarStubAction(
                      businessId,
                      email || undefined,
                    );
                    setMessage(
                      res.success ? "Calendar connected (stub / demo)." : (res.error ?? "Failed"),
                    );
                    router.refresh();
                  })
                }
              >
                Connect stub (dev)
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {oauthConfigured && connectionMode !== "oauth" ? (
            <a href={startHref} className={linkBtnClass}>
              Upgrade to live Google
            </a>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await disconnectGoogleCalendarAction(businessId);
                setMessage(res.success ? "Disconnected." : (res.error ?? "Failed"));
                router.refresh();
              })
            }
          >
            Disconnect
          </Button>
        </div>
      )}

      {message ? <p className="text-sm text-brand-ink">{message}</p> : null}
    </div>
  );
}
