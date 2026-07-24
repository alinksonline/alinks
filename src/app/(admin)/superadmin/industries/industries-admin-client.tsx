"use client";

import { useState, useTransition } from "react";
import {
  saveIndustrySettingsAction,
  saveModulePriceAction,
} from "@/app/actions/industries-admin";
import type { EffectiveModule } from "@/platform/billing/entitlements";

type IndustryRow = {
  group: string;
  label: string;
  selectable: boolean;
  salesEnabled: boolean;
  commerceModulesAllowed: boolean;
  bookingModulesAllowed: boolean;
  licenseGate: boolean;
  enabled: boolean;
  creatorDiscountPctMonthly: number | null;
  creatorDiscountPctYearly: number | null;
  creatorLaunchCoupon: string | null;
};

export function IndustriesAdminClient({
  industries: initialIndustries,
  catalog: initialCatalog,
}: {
  industries: IndustryRow[];
  catalog: EffectiveModule[];
}) {
  const [industries, setIndustries] = useState(initialIndustries);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const saveIndustry = (row: IndustryRow) => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveIndustrySettingsAction({
        industryGroup: row.group,
        enabled: row.enabled,
        creatorDiscountPctMonthly: row.creatorDiscountPctMonthly,
        creatorDiscountPctYearly: row.creatorDiscountPctYearly,
        creatorLaunchCoupon: row.creatorLaunchCoupon,
      });
      setMessage(res.success ? `Saved ${row.label}` : res.error ?? "Failed");
    });
  };

  const saveModule = (m: EffectiveModule) => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveModulePriceAction({
        sku: m.sku,
        monthlyPrice: m.effectiveMonthly,
        yearlyPrice: m.effectiveYearly,
        enabled: m.overrideEnabled,
      });
      setMessage(res.success ? `Saved module ${m.sku}` : res.error ?? "Failed");
    });
  };

  return (
    <div className="mt-8 space-y-10">
      {message && (
        <p className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">
          {message}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-white">Industries</h2>
        <p className="mt-1 text-sm text-slate-500">
          Flags from registry · enable/disable + Creator discount fields for Presence.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Industry</th>
                <th className="px-3 py-2 font-medium">Sales</th>
                <th className="px-3 py-2 font-medium">Commerce</th>
                <th className="px-3 py-2 font-medium">Enabled</th>
                <th className="px-3 py-2 font-medium">Creator % mo</th>
                <th className="px-3 py-2 font-medium">Creator % yr</th>
                <th className="px-3 py-2 font-medium">Launch coupon</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {industries.map((row, idx) => (
                <tr key={row.group} className="border-t border-slate-800">
                  <td className="px-3 py-2">
                    <p className="font-medium text-white">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.group}</p>
                    {!row.salesEnabled && (
                      <p className="text-xs text-amber-400/90">No sales (e.g. Presence)</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-300">{row.salesEnabled ? "yes" : "no"}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {row.commerceModulesAllowed ? "yes" : "no"}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => {
                        const next = [...industries];
                        next[idx] = { ...row, enabled: e.target.checked };
                        setIndustries(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1"
                      value={row.creatorDiscountPctMonthly ?? ""}
                      onChange={(e) => {
                        const next = [...industries];
                        next[idx] = {
                          ...row,
                          creatorDiscountPctMonthly: e.target.value === "" ? null : Number(e.target.value),
                        };
                        setIndustries(next);
                      }}
                      disabled={row.group !== "presence"}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1"
                      value={row.creatorDiscountPctYearly ?? ""}
                      onChange={(e) => {
                        const next = [...industries];
                        next[idx] = {
                          ...row,
                          creatorDiscountPctYearly: e.target.value === "" ? null : Number(e.target.value),
                        };
                        setIndustries(next);
                      }}
                      disabled={row.group !== "presence"}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-28 rounded border border-slate-700 bg-slate-950 px-2 py-1"
                      value={row.creatorLaunchCoupon ?? ""}
                      onChange={(e) => {
                        const next = [...industries];
                        next[idx] = { ...row, creatorLaunchCoupon: e.target.value || null };
                        setIndustries(next);
                      }}
                      disabled={row.group !== "presence"}
                      placeholder="CREATOR"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveIndustry(row)}
                      className="rounded bg-sky-600 px-2.5 py-1 text-xs font-semibold hover:bg-sky-500 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Module catalog</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select modules pricing (monthly / yearly). Status: shipped · stub · later.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Monthly ₹</th>
                <th className="px-3 py-2 font-medium">Yearly ₹</th>
                <th className="px-3 py-2 font-medium">On</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {catalog.map((m, idx) => (
                <tr key={m.sku} className="border-t border-slate-800">
                  <td className="px-3 py-2 font-mono text-xs text-slate-300">{m.sku}</td>
                  <td className="px-3 py-2 text-white">
                    {m.name}
                    {m.includedInWebsite && (
                      <span className="ml-2 text-xs text-emerald-400">incl. website</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{m.status}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1"
                      value={m.effectiveMonthly}
                      onChange={(e) => {
                        const next = [...catalog];
                        next[idx] = { ...m, effectiveMonthly: Number(e.target.value) || 0 };
                        setCatalog(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1"
                      value={m.effectiveYearly}
                      onChange={(e) => {
                        const next = [...catalog];
                        next[idx] = { ...m, effectiveYearly: Number(e.target.value) || 0 };
                        setCatalog(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={m.overrideEnabled}
                      onChange={(e) => {
                        const next = [...catalog];
                        next[idx] = { ...m, overrideEnabled: e.target.checked };
                        setCatalog(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveModule(m)}
                      className="rounded bg-sky-600 px-2.5 py-1 text-xs font-semibold hover:bg-sky-500 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
