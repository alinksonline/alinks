import { AdReviewButtons } from "@/components/admin/ad-review-buttons";
import { PageShell } from "@/components/shared/page-shell";
import { getSuperadminOverview } from "@/platform/admin/get-overview";
import { LicenseReviewButtons } from "../license-review-buttons";

export default async function SuperadminCompliancePage() {
  const overview = await getSuperadminOverview();
  if (!overview) return null;

  const businessById = new Map(overview.businessesList.map((b) => [b.id, b]));

  return (
    <PageShell maxWidth="xl" className="py-10">
      <h1 className="text-3xl font-bold">Compliance queues</h1>
      <p className="mt-2 text-slate-400">Clinic licenses, pharmacy OTC, and ad slot reviews.</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Clinic NMC licenses ({overview.pendingLicenses})</h2>
        <div className="mt-4 space-y-2">
          {overview.pendingLicenseList.map((license) => {
            const biz = businessById.get(license.businessId);
            return (
              <div key={license.id} className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{license.doctorName}</p>
                    <p className="text-sm text-slate-400">{biz?.name ?? "Unknown"} · {license.licenseNumber}</p>
                  </div>
                  <LicenseReviewButtons licenseId={license.id} />
                </div>
              </div>
            );
          })}
          {overview.pendingLicenses === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center text-slate-500">No pending clinic licenses.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Pharmacy OTC pending ({overview.pendingPharmacy})</h2>
        <div className="mt-4 space-y-2">
          {overview.pendingPharmacyList.map((b) => (
            <div key={b.id} className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="font-medium">{b.name}</p>
              <p className="text-sm text-slate-400">/{b.handle} · approve from Businesses page</p>
            </div>
          ))}
          {overview.pendingPharmacy === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center text-slate-500">No pending pharmacy approvals.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Ad slots pending ({overview.pendingAds})</h2>
        <div className="mt-4 space-y-2">
          {overview.pendingAdList.map((slot) => {
            const biz = slot.businessId ? businessById.get(slot.businessId) : null;
            return (
              <div key={slot.id} className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{slot.advertiser}</p>
                    <p className="text-sm text-slate-400">{slot.placement}{biz ? ` · ${biz.name}` : ""}</p>
                  </div>
                  <AdReviewButtons slotId={slot.id} />
                </div>
              </div>
            );
          })}
          {overview.pendingAds === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center text-slate-500">No pending ad slots.</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}