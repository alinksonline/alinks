import type { Business } from "@/core/types/tenant";
import Link from "next/link";

export function TenantFooter({ business, showAlinksBranding = true }: { business: Business; showAlinksBranding?: boolean }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center text-xs text-slate-600">
      {/* Doc 03 End-User Notice — full lawyer text in Phase 1 */}
      <p className="mb-2 max-w-lg mx-auto px-4">
        This site is operated independently by the business named above. Artix provides software only and is not the seller, service provider, or data controller for customer transactions.
      </p>
      <p className="mb-2">
        Operated independently by <strong>{business.name}</strong> — not Artix.
      </p>
      <p className="mb-2">
        <Link href={`/${business.handle}/terms`} className="underline">
          Terms
        </Link>
        {" · "}
        <Link href={`/${business.handle}/privacy`} className="underline">
          Privacy
        </Link>
      </p>
      {showAlinksBranding && (
        <p>
          <Link href="https://alinks.online" className="text-slate-500">
            Powered by ALINKS
          </Link>
        </p>
      )}
    </footer>
  );
}