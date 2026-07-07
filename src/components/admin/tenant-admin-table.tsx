"use client";

import { useTransition } from "react";
import { updateTenantStatusAction, updateTenantTierAction } from "@/app/actions/superadmin";
import type { SubscriptionTier } from "@/core/config/tiers";

export function TenantAdminTable({
  tenants,
}: {
  tenants: {
    id: string;
    name: string | null;
    email: string;
    phone: string;
    tier: string;
    status: string;
    aiCredits: number;
    locale: string;
    trialEndsAt: Date | null;
  }[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">Tenant</th>
            <th className="px-4 py-2">Tier</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">AI credits</th>
            <th className="px-4 py-2">Locale</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id} className="border-t border-slate-800">
              <td className="px-4 py-3">
                <p className="font-medium">{t.name ?? t.email}</p>
                <p className="text-xs text-slate-400">{t.phone}</p>
              </td>
              <td className="px-4 py-3">
                <select
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  disabled={isPending}
                  defaultValue={t.tier}
                  onChange={(e) =>
                    startTransition(async () => {
                      await updateTenantTierAction(t.id, e.target.value as SubscriptionTier);
                    })
                  }
                >
                  <option value="basic">basic</option>
                  <option value="pro">pro</option>
                  <option value="enterprise">enterprise</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <select
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  disabled={isPending}
                  defaultValue={t.status}
                  onChange={(e) =>
                    startTransition(async () => {
                      await updateTenantStatusAction(t.id, e.target.value);
                    })
                  }
                >
                  <option value="trial">trial</option>
                  <option value="active">active</option>
                  <option value="past_due">past_due</option>
                  <option value="suspended">suspended</option>
                </select>
              </td>
              <td className="px-4 py-3">{t.aiCredits}</td>
              <td className="px-4 py-3">{t.locale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}