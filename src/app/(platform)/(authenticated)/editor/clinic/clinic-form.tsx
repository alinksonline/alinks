"use client";

import { useState, useTransition } from "react";
import { submitClinicLicenseAction } from "@/app/actions/clinic";
import { Button } from "@/components/ui/button";

export function ClinicForm({ businessId }: { businessId: string }) {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await submitClinicLicenseAction({
            businessId,
            licenseNumber,
            doctorName,
            documentUrl: documentUrl || undefined,
          });
          setMessage(r.success ? "License submitted for review" : r.error ?? "");
        });
      }}
    >
      <div>
        <label className="text-sm font-medium">License number</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="NMC / state council number"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Doctor name</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          placeholder="Dr. ..."
        />
      </div>
      <div>
        <label className="text-sm font-medium">Document URL (optional)</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          value={documentUrl}
          onChange={(e) => setDocumentUrl(e.target.value)}
          placeholder="https://..."
        />
        <p className="mt-1 text-xs text-slate-500">Link to uploaded registration scan.</p>
      </div>
      <Button type="submit" disabled={isPending || !licenseNumber.trim() || !doctorName.trim()}>
        Submit for review
      </Button>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </form>
  );
}