"use client";

import { useTransition } from "react";
import Link from "next/link";
import { approvePharmacyOtcAction, toggleBusinessPublishAction } from "@/app/actions/superadmin";

export function BusinessAdminTable({
  businesses,
}: {
  businesses: {
    id: string;
    name: string;
    handle: string;
    vertical: string;
    isPublished: boolean;
    checkoutMode: string;
    verticalGateStatus: string;
    pharmacyOtcApproved: boolean;
    metaCatalogEnabled: boolean;
  }[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">Business</th>
            <th className="px-4 py-2">Vertical</th>
            <th className="px-4 py-2">Checkout</th>
            <th className="px-4 py-2">Gate</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((b) => (
            <tr key={b.id} className="border-t border-slate-800">
              <td className="px-4 py-3">
                <p className="font-medium">{b.name}</p>
                <Link href={`/${b.handle}`} className="text-xs text-sky-400 underline" target="_blank">
                  /{b.handle}
                </Link>
                <p className={`mt-1 text-xs font-bold uppercase ${b.isPublished ? "text-emerald-400" : "text-amber-400"}`}>
                  {b.isPublished ? "Published" : "Draft"}
                </p>
              </td>
              <td className="px-4 py-3">{b.vertical}</td>
              <td className="px-4 py-3">{b.checkoutMode}</td>
              <td className="px-4 py-3 text-xs text-slate-400">{b.verticalGateStatus}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700"
                    onClick={() =>
                      startTransition(async () => {
                        await toggleBusinessPublishAction(b.id, !b.isPublished);
                      })
                    }
                  >
                    {b.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  {b.vertical === "pharmacy" && !b.pharmacyOtcApproved && (
                    <button
                      type="button"
                      disabled={isPending}
                      className="rounded bg-violet-900 px-2 py-1 text-xs hover:bg-violet-800"
                      onClick={() =>
                        startTransition(async () => {
                          await approvePharmacyOtcAction(b.id);
                        })
                      }
                    >
                      Approve OTC
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}