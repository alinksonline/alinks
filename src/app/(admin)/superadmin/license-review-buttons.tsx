"use client";

import { useTransition } from "react";
import { reviewClinicLicenseAction } from "@/app/actions/clinic";
import { Button } from "@/components/ui/button";

export function LicenseReviewButtons({ licenseId }: { licenseId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => { await reviewClinicLicenseAction(licenseId, true); })}
      >
        Approve
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() => startTransition(async () => { await reviewClinicLicenseAction(licenseId, false); })}
      >
        Reject
      </Button>
    </div>
  );
}