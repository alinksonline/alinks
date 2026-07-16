"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  connectGoogleCalendarStubAction,
  disconnectGoogleCalendarAction,
} from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";

export function GoogleCalendarForm({
  businessId,
  connected,
  googleEmail,
  connectionMode,
  lastError,
}: {
  businessId: string;
  connected: boolean;
  googleEmail: string | null;
  connectionMode: string;
  lastError: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(googleEmail ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="premium-card mt-5 space-y-4 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-brand-ink">
          Status: {connected ? "Connected" : "Not connected"}
        </p>
        {connected && googleEmail ? (
          <p className="mt-1 text-xs text-brand-muted">{googleEmail}</p>
        ) : null}
        {connectionMode === "stub" && connected ? (
          <p className="mt-1 text-xs text-amber-800">
            Stub mode — bookings mark a calendar event id without calling Google APIs yet.
          </p>
        ) : null}
        {lastError ? <p className="mt-1 text-xs text-red-600">{lastError}</p> : null}
      </div>

      {!connected ? (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">
              Gmail (optional note for stub)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await connectGoogleCalendarStubAction(businessId, email || undefined);
                setMessage(res.success ? "Calendar connected (free stub)." : res.error ?? "Failed");
                router.refresh();
              })
            }
          >
            Connect Google Calendar (free)
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await disconnectGoogleCalendarAction(businessId);
              setMessage(res.success ? "Disconnected." : res.error ?? "Failed");
              router.refresh();
            })
          }
        >
          Disconnect
        </Button>
      )}

      {message ? <p className="text-sm text-brand-ink">{message}</p> : null}
    </div>
  );
}
