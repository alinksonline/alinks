"use client";

import { useState, useTransition } from "react";
import { setCustomDomainAction, verifyCustomDomainAction } from "@/app/actions/domain";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function DomainWizard({
  businessId,
  currentDomain,
  verified,
  verifyToken,
}: {
  businessId: string;
  currentDomain: string;
  verified: boolean;
  verifyToken: string;
}) {
  const [domain, setDomain] = useState(currentDomain);
  const [token, setToken] = useState(verifyToken);
  const [txt, setTxt] = useState<{ host: string; value: string } | null>(null);
  const [cname, setCname] = useState<{ host: string; value: string } | null>(null);
  const [message, setMessage] = useState(verified ? "Domain verified and live." : "");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6 space-y-4">
      <input
        className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
        placeholder="shop.example.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await setCustomDomainAction(businessId, domain);
            if (result.success) {
              setTxt(result.txtRecord);
              setCname(result.cnameRecord);
              setToken(result.txtRecord.value);
              setMessage("Add DNS records below, then verify."); toast.info("Add DNS records below, then verify.");
            } else {
              { setMessage(result.error ?? ""); toast.error(result.error ?? "Failed"); }
            }
          })
        }
      >
        Save domain
      </Button>

      {txt && (
        <div className="rounded-lg border bg-slate-50 p-4 text-sm font-mono">
          <p className="font-sans font-semibold text-slate-900">Step 1 — TXT record</p>
          <p className="mt-2">Host: {txt.host}</p>
          <p>Value: {txt.value}</p>
          {cname && (
            <>
              <p className="mt-4 font-sans font-semibold text-slate-900">Step 2 — CNAME record</p>
              <p className="mt-2">Host: {cname.host}</p>
              <p>Points to: {cname.value}</p>
            </>
          )}
        </div>
      )}

      {token && !verified && (
        <div className="space-y-2">
          <input
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste TXT verification token"
          />
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await verifyCustomDomainAction(businessId, token);
                if (result.success) { setMessage(`Verified: ${result.domain}`); toast.success(`Verified: ${result.domain}`); } else { { const __e = result.error ?? "Failed"; setMessage(__e); toast.error(__e); } toast.error(result.error ?? "Failed"); }
              })
            }
          >
            Verify domain
          </Button>
        </div>
      )}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}