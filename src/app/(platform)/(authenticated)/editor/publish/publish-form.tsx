"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishWebsiteAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";

export function PublishForm({
  businessId,
  isPublished,
  gateOk,
}: {
  businessId: string;
  isPublished: boolean;
  gateOk: boolean;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isPublished) {
    return <p className="text-emerald-700 font-medium">Your website is live.</p>;
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await publishWebsiteAction(businessId, confirm);
          if (!result.success) setError(result.error ?? "Failed");
          else router.refresh();
        });
      }}
    >
      <label className="flex gap-2 text-sm">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
        I confirm my Terms & Privacy are accurate and the independent-operator footer is enabled
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isPending || !gateOk || !confirm}>
        Publish website
      </Button>
    </form>
  );
}